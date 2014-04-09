(function() {
  var BubbleChart, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  BubbleChart = (function() {
    function BubbleChart(data) {
      this.hide_details = __bind(this.hide_details, this);
      this.show_details = __bind(this.show_details, this);
      this.hide_years = __bind(this.hide_years, this);
      this.display_years = __bind(this.display_years, this);
      this.move_towards_year = __bind(this.move_towards_year, this);
      this.move_to_location_func = __bind(this.move_to_location_func, this);
      this.move_towards_candidates = __bind(this.move_towards_candidates, this);
      this.split_candidates = __bind(this.split_candidates, this);
      this.display_by_year = __bind(this.display_by_year, this);
      this.move_towards_center = __bind(this.move_towards_center, this);
      this.display_group_all = __bind(this.display_group_all, this);
      this.start = __bind(this.start, this);
      this.create_vis = __bind(this.create_vis, this);
      this.bind_data = __bind(this.bind_data, this);
      this.create_nodes = __bind(this.create_nodes, this);
      var max_amount;
      this.data = data;
      this.width = 1250;
      this.height = 900;
      this.tooltip = CustomTooltip("gates_tooltip", 240);
      this.center = {
        x: this.width / 2,
        y: this.height / 2
      };
      this.layout_gravity = -0.01;
      this.damper = 0.1;
      this.vis = null;
      this.nodes = [];
      this.force = null;
      this.circles = null;
      this.fill_color = function(d) {
        return d3.scale.linear().domain([-1000, 1000]).range(['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd'])(hash_code(d.name) % 1000);
      };
      max_amount = d3.max(this.data, function(d) {
        return parseInt(d.amount);
      });
      this.radius_scale = d3.scale.pow().exponent(0.5).domain([0, max_amount]).range([2, 85]);
      this.create_nodes();
      this.create_vis();
    }

    BubbleChart.prototype.create_nodes = function() {
      this.data.forEach((function(_this) {
        return function(d) {
          var node;
          node = {
            id: d.id,
            radius: _this.radius_scale(parseInt(d.amount)),
            value: d.amount,
            name: d.candidate_name,
            org: 'org',
            group: 'group',
            category: d.expenditure_category,
            office: d.office,
            election_period: d.election_period,
            x: Math.random() * 900,
            y: Math.random() * 800
          };
          return _this.nodes.push(node);
        };
      })(this));
      this.nodes.sort(function(a, b) {
        return b.value - a.value;
      });
      return window.nodes = this.nodes;
    };

    BubbleChart.prototype.bind_data = function() {
      var obj, that;
      obj = {
        category: 'fun',
        election_period: '2010-2012',
        group: 'gr',
        id: 999,
        name: 'jason',
        office: 'gov',
        org: 'org',
        value: '$110322.21',
        radius: 100,
        x: 500,
        y: 244
      };
      this.nodes.push(obj);
      this.circles = this.vis.selectAll("circle").data(this.nodes, function(d) {
        return d.id;
      });
      that = this;
      this.circles.enter().append("circle").attr("fill", (function(_this) {
        return function(d) {
          return _this.fill_color(d);
        };
      })(this)).attr("stroke-width", 2).attr("stroke", (function(_this) {
        return function(d) {
          return d3.rgb(_this.fill_color(d)).darker();
        };
      })(this)).attr("id", function(d) {
        return "bubble_" + d.id;
      }).on("mouseover", function(d, i) {
        return that.show_details(d, i, this);
      }).on("mouseout", function(d, i) {
        return that.hide_details(d, i, this);
      });
      this.circles.exit().remove();
      this.circles.transition().duration(1000).attr("r", function(d) {
        return d.radius;
      });
      return this.display_group_all();
    };

    BubbleChart.prototype.create_vis = function() {
      var that;
      this.vis = d3.select("#vis").append("svg").attr("width", this.width).attr("height", this.height).attr("id", "svg_vis");
      this.circles = this.vis.selectAll("circle").data(this.nodes, function(d) {
        return d.id;
      });
      that = this;
      this.circles.enter().append("circle").attr("r", 0).attr("fill", (function(_this) {
        return function(d) {
          return _this.fill_color(d);
        };
      })(this)).attr("stroke-width", 2).attr("stroke", (function(_this) {
        return function(d) {
          return d3.rgb(_this.fill_color(d)).darker();
        };
      })(this)).attr("id", function(d) {
        return "bubble_" + d.id;
      }).on("mouseover", function(d, i) {
        return that.show_details(d, i, this);
      }).on("mouseout", function(d, i) {
        return that.hide_details(d, i, this);
      });
      return this.circles.transition().duration(2000).attr("r", function(d) {
        return d.radius;
      });
    };

    BubbleChart.prototype.charge = function(d) {
      return -Math.pow(d.radius, 2.0) / 8;
    };

    BubbleChart.prototype.start = function() {
      return this.force = d3.layout.force().nodes(this.nodes).size([this.width, this.height]);
    };

    BubbleChart.prototype.display_group_all = function() {
      this.force.gravity(this.layout_gravity).charge(this.charge).friction(0.9).on("tick", (function(_this) {
        return function(e) {
          return _this.circles.each(_this.move_towards_center(e.alpha)).attr("cx", function(d) {
            return d.x;
          }).attr("cy", function(d) {
            return d.y;
          });
        };
      })(this));
      this.force.start();
      return this.hide_years();
    };

    BubbleChart.prototype.move_towards_center = function(alpha) {
      return (function(_this) {
        return function(d) {
          d.x = d.x + (_this.center.x - d.x) * (_this.damper + 0.02) * alpha;
          return d.y = d.y + (_this.center.y - d.y) * (_this.damper + 0.02) * alpha;
        };
      })(this);
    };

    BubbleChart.prototype.display_by_year = function() {
      this.force.gravity(this.layout_gravity).charge(this.charge).friction(0.9).on("tick", (function(_this) {
        return function(e) {
          return _this.circles.each(_this.move_towards_year(e.alpha)).attr("cx", function(d) {
            return d.x;
          }).attr("cy", function(d) {
            return d.y;
          });
        };
      })(this));
      this.force.start();
      return this.display_years();
    };

    BubbleChart.prototype.split_candidates = function() {
      var location_func, titles;
      location_func = this.move_to_location_func(this.nodes, function(d) {
        return d.name;
      });
      this.force.gravity(this.layout_gravity).charge(this.charge).chargeDistance(200).friction(0.9).on("tick", (function(_this) {
        return function(e) {
          return _this.circles.each(_this.move_towards_candidates(e.alpha, location_func)).attr('cx', function(d) {
            return d.x;
          }).attr('cy', function(d) {
            return d.y;
          });
        };
      })(this));
      this.force.start();
      titles = this.vis.selectAll('.years').data(location_func.values());
      return titles.enter().append('text').text(function(d) {
        return d.name;
      }).attr("text-anchor", "middle").attr('x', function(d) {
        return d.x;
      }).attr('y', function(d) {
        return d.y + 200;
      });
    };

    BubbleChart.prototype.move_towards_candidates = function(alpha, location_func) {
      return (function(_this) {
        return function(d) {
          var target;
          target = location_func.get(d.name);
          d.x = d.x + (target.x - d.x) * (_this.damper + 0.02) * alpha * 1.1;
          return d.y = d.y + (target.y - d.y) * (_this.damper + 0.02) * alpha * 1.1;
        };
      })(this);
    };

    BubbleChart.prototype.move_to_location_func = function(nodes, grouping_func) {
      var get_height, get_width, groupings_per_row, groups, i, min_grouping_height, min_grouping_width;
      min_grouping_width = 300;
      groupings_per_row = Math.floor(this.width / min_grouping_width) - 1;
      min_grouping_height = 300;
      get_width = (function(_this) {
        return function(i) {
          return ((i % groupings_per_row) + 1) * min_grouping_width;
        };
      })(this);
      get_height = (function(_this) {
        return function(i) {
          var num_row;
          num_row = Math.floor(i / groupings_per_row) + 1;
          return num_row * min_grouping_height;
        };
      })(this);
      groups = d3.nest().key(grouping_func).rollup(function(leaves) {
        return {
          sum: d3.sum(leaves, function(d) {
            return parseFloat(d.value);
          })
        };
      }).map(nodes, d3.map);
      i = 0;
      groups.keys().sort(d3.ascending).forEach(function(key) {
        var entry;
        entry = groups.get(key);
        entry['name'] = key;
        entry['x'] = get_width(i);
        entry['y'] = get_height(i);
        groups.set(key, entry);
        return i += 1;
      });
      return groups;
    };

    BubbleChart.prototype.move_towards_year = function(alpha) {
      return (function(_this) {
        return function(d) {
          var target;
          target = _this.year_centers[d.election_period];
          d.x = d.x + (target.x - d.x) * (_this.damper + 0.02) * alpha * 1.1;
          return d.y = d.y + (target.y - d.y) * (_this.damper + 0.02) * alpha * 1.1;
        };
      })(this);
    };

    BubbleChart.prototype.display_years = function() {
      var years, years_data, years_x;
      years_x = {
        "2008-2010": 160,
        "2010-2012": this.width / 2,
        "2012-2014": this.width - 160
      };
      years_data = d3.keys(years_x);
      years = this.vis.selectAll(".years").data(years_data);
      return years.enter().append("text").attr("class", "years").attr("text-anchor", "middle").attr("x", (function(_this) {
        return function(d) {
          return years_x[d];
        };
      })(this)).attr("y", 40).text(function(d) {
        return 'af';
      });
    };

    BubbleChart.prototype.hide_years = function() {
      var years;
      return years = this.vis.selectAll(".years").remove();
    };

    BubbleChart.prototype.show_details = function(data, i, element) {
      var content;
      d3.select(element).attr("stroke", "black");
      content = "<span class=\"name\">Candidate:</span><span class=\"value\"> " + data.name + "</span><br/>";
      content += "<span class=\"name\">Amount:</span><span class=\"value\"> $" + (addCommas(data.value)) + "</span><br/>";
      content += "<span class=\"name\">Category:</span><span class=\"value\"> " + data.category + "</span><br/>";
      content += "<span class=\"name\">Office:</span><span class=\"value\"> " + data.office + "</span><br/>";
      content += "<span class=\"name\">Election Period:</span><span class=\"value\"> " + data.election_period + "</span>";
      return this.tooltip.showTooltip(content, d3.event);
    };

    BubbleChart.prototype.hide_details = function(data, i, element) {
      d3.select(element).attr("stroke", (function(_this) {
        return function(d) {
          return d3.rgb(_this.fill_color(d)).darker();
        };
      })(this));
      return this.tooltip.hideTooltip();
    };

    return BubbleChart;

  })();

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  $(function() {
    var chart, render_vis;
    $('.filter-buttons .button').on('click', function(e) {
      e.preventDefault();
      console.log('clicked filter button!');
      return window.get_chart().split_candidates();
    });
    console.log('begin vis.coffee');
    window.counter = 0;
    chart = null;
    render_vis = function(csv) {
      var filtered_csv, mygroups, reduced;
      filtered_csv = csv.filter(function(d) {
        return d.election_period === '2010-2012' && d.office === 'Governor';
      });
      reduced = _.reduce(filtered_csv, function(acc, d) {
        var curr;
        curr = acc[d.candidate_name];
        if (curr == null) {
          curr = [];
        }
        curr.push(d);
        curr = _.sortBy(curr, function(d) {
          return parseInt(d.amount.slice(5));
        }).reverse();
        acc[d.candidate_name] = _.first(curr, 1);
        return acc;
      }, {});
      chart = new BubbleChart(filtered_csv);
      chart.start();
      root.display_all();
      mygroups = chart.move_to_location_func(window.nodes, (function(_this) {
        return function(d) {
          return d.name;
        };
      })(this));
      _.each(mygroups.values(), function(d) {
        return console.log(JSON.stringify(d));
      });
      console.log(mygroups);
      return window.mygroups = mygroups;
    };
    root.display_all = (function(_this) {
      return function() {
        return chart.display_group_all();
      };
    })(this);
    root.get_chart = (function(_this) {
      return function() {
        return chart;
      };
    })(this);
    root.display_year = (function(_this) {
      return function() {
        return chart.display_by_year();
      };
    })(this);
    root.toggle_view = (function(_this) {
      return function(view_type) {
        if (view_type === 'year') {
          return root.display_year();
        } else {
          return root.display_all();
        }
      };
    })(this);
    $('#viz_nav_container .viz_nav').on('click', function(e) {
      var func;
      e.preventDefault();
      func = $(e.target).data('name');
      if (func === 'candidate') {
        return window.get_chart().split_candidates();
      }
    });
    return d3.csv("data/campaign_spending_summary.csv", render_vis);
  });

}).call(this);
