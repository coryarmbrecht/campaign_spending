(function() {
  var BubbleChart, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  BubbleChart = (function() {
    function BubbleChart(data) {
      this.hide_details = __bind(this.hide_details, this);
      this.show_details = __bind(this.show_details, this);
      this.move_towards_year = __bind(this.move_towards_year, this);
      this.get_candidate_short_name = __bind(this.get_candidate_short_name, this);
      this.get_supercategory = __bind(this.get_supercategory, this);
      this.move_to_location_map = __bind(this.move_to_location_map, this);
      this.move_towards_candidates = __bind(this.move_towards_candidates, this);
      this.format_money_millions = __bind(this.format_money_millions, this);
      this.do_split = __bind(this.do_split, this);
      this.split_amount = __bind(this.split_amount, this);
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
      this.height = 3500;
      this.tooltip = CustomTooltip("expenditure_tooltip", 300);
      this.center = {
        x: this.width / 2,
        y: Math.min(this.height / 2, 400)
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
            party: d.party,
            category: d.expenditure_category,
            super_category: _this.get_supercategory(d.expenditure_category),
            office: d.office,
            election_period: d.election_period,
            election_year: d.election_period.split('-')[1],
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
      })(this)).attr("stroke-width", 2).attr("id", function(d) {
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
      this.circles.enter().append("circle").attr("r", 0).attr('class', (function(_this) {
        return function(d) {
          return _this.get_supercategory(d.category);
        };
      })(this)).attr("stroke-width", 2).attr("id", function(d) {
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
      return -(Math.pow(d.radius, 2.0) / 7) + -(d.radius * 0.1) + -.3;
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
      return this.force.start();
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

    BubbleChart.prototype.split_amount = function() {};

    BubbleChart.prototype.do_split = function(accessor) {
      var location_map, titles;
      location_map = this.move_to_location_map(this.nodes, accessor);
      this.force.gravity(0).charge(this.charge).chargeDistance(300).friction(0.87).on("tick", (function(_this) {
        return function(e) {
          return _this.circles.each(_this.move_towards_candidates(e.alpha, location_map, accessor)).attr('cx', function(d) {
            return d.x;
          }).attr('cy', function(d) {
            return d.y;
          });
        };
      })(this));
      this.force.start();
      titles = this.vis.selectAll('text.titles').data(location_map.values(), function(d) {
        return d.key;
      });
      titles.enter().append('text').attr("class", "titles header").text(function(d) {
        return d.key;
      }).attr("text-anchor", "middle").attr('x', function(d) {
        return d.x;
      }).attr('y', function(d) {
        return d.y + 200;
      });
      titles.enter().append('text').attr('class', 'titles amount').text((function(_this) {
        return function(d) {
          return _this.format_money_millions(parseFloat(d.sum));
        };
      })(this)).attr('text-anchor', 'middle').attr('x', function(d) {
        return d.x;
      }).attr('y', function(d) {
        return d.y + 220;
      });
      return titles.exit().remove();
    };

    BubbleChart.prototype.format_money_millions = function(amount_in_dollars) {
      return d3.format('$,.2f')(amount_in_dollars / 1e6) + ' million';
    };

    BubbleChart.prototype.move_towards_candidates = function(alpha, location_map, accessor) {
      return (function(_this) {
        return function(d) {
          var target;
          target = location_map.get(accessor(d));
          d.x = d.x + (target.x - d.x) * (_this.damper + 0.02) * alpha * 1.1;
          return d.y = d.y + (target.y - d.y) * (_this.damper + 0.02) * alpha * 1.1;
        };
      })(this);
    };

    BubbleChart.prototype.move_to_location_map = function(nodes, grouping_func) {
      var get_height, get_width, groupings_per_row, groups, i, min_grouping_height, min_grouping_width;
      min_grouping_width = 300;
      groupings_per_row = Math.floor(this.width / min_grouping_width) - 1;
      min_grouping_height = 350;
      get_width = (function(_this) {
        return function(i) {
          return ((i % groupings_per_row) + 1) * min_grouping_width;
        };
      })(this);
      get_height = (function(_this) {
        return function(i) {
          var num_row;
          num_row = Math.floor(i / groupings_per_row) + 1;
          return num_row * min_grouping_height - 100;
        };
      })(this);
      groups = d3.nest().key(grouping_func).rollup((function(_this) {
        return function(leaves) {
          return {
            sum: d3.sum(leaves, function(d) {
              return parseFloat(d.value);
            }),
            candidates: d3.set(leaves.map(_this.get_candidate_short_name)).values()
          };
        };
      })(this)).map(nodes, d3.map);
      i = 0;
      groups.keys().sort(function(a, b) {
        return d3.descending(parseFloat(groups.get(a).sum), parseFloat(groups.get(b).sum));
      }).forEach(function(key) {
        var entry;
        entry = groups.get(key);
        entry['key'] = key;
        entry['x'] = get_width(i);
        entry['y'] = get_height(i);
        groups.set(key, entry);
        return i += 1;
      });
      return groups;
    };

    BubbleChart.prototype.get_supercategory = function(category) {
      if (category === 'Durable Assets' || category === 'Food & Beverages' || category === 'Insurance' || category === 'Lease/Rent' || category === 'Office Supplies' || category === 'Travel & Lodging' || category === 'Utilities' || category === 'Vehicle') {
        return 'overhead';
      } else if (category === 'Contribution to Community Organization' || category === 'Contribution to Political Party' || category === 'Hawaii Election Campaign Fund') {
        return 'contributions';
      } else if (category === 'Advertising' || category === 'Candidate Fundraiser Tickets' || category === 'Postage/Mailing' || category === 'Printing' || category === 'Surveys, Polls & Voter Lists') {
        return 'communication';
      } else if (category === 'Employee Services' || category === 'Professional Services') {
        return 'staff';
      } else if (category === 'Bank Charges & Adjustments' || category === 'Filing Fee' || category === 'Taxes') {
        return 'fees';
      } else if (category === 'Other') {
        return 'other';
      }
    };

    BubbleChart.prototype.get_candidate_short_name = function(d) {
      return d.name.split(',')[0] + (" (" + d.party[0] + ")");
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

    BubbleChart.prototype.show_details = function(data, i, element) {
      var content;
      d3.select(element).attr("stroke", "black");
      content = "<div class=\"inner_tooltip\">";
      content += "<span class=\"candidate\">" + data.name + "</span><br/>";
      content += "" + data.election_year + ", " + data.office + "<br/>";
      content += "<span class=\"amount\"> " + data.category + " $" + (addCommas(data.value)) + "</span><br/>";
      content += "</div>";
      this.tooltip.showTooltip(content, d3.event);
      return d3.select(element).move_to_front();
    };

    BubbleChart.prototype.hide_details = function(data, i, element) {
      d3.select(element).attr("stroke", '');
      return this.tooltip.hideTooltip();
    };

    return BubbleChart;

  })();

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  $(function() {
    var chart, filter_data, join_data, render_vis;
    chart = null;
    join_data = function(expend_recs, org_recs) {
      var expend_rec, full_records, i, j, org_rec;
      full_records = [];
      i = 0;
      j = 0;
      while (true) {
        expend_rec = expend_recs[i];
        org_rec = org_recs[j];
        if ((expend_rec == null) || (org_rec == null)) {
          break;
        }
        if (expend_rec.reg_no === org_rec.reg_no) {
          full_records.push($.extend({}, expend_rec, org_rec));
          i++;
        } else if (expend_rec.reg_no !== org_rec.reg_no) {
          j++;
        }
      }
      return full_records;
    };
    filter_data = function(records) {
      var filtered_csv, reduced, sorted;
      filtered_csv = records.filter(function(d) {
        return d.election_period === '2012-2014';
      });
      sorted = filtered_csv.sort(function(a, b) {
        return d3.descending(parseFloat(a.amount), parseFloat(b.amount));
      });
      reduced = _.reduce(filtered_csv, function(acc, d) {
        var curr;
        curr = acc[d.candidate_name];
        if (curr == null) {
          curr = [];
        }
        curr.push(d);
        curr = _.sortBy(curr, function(d) {
          return parseFloat(d.amount.slice(5));
        }).reverse();
        acc[d.candidate_name] = _.first(curr, 1);
        return acc;
      }, {});
      filtered_csv;
      return sorted;
    };
    render_vis = function(error, expenditure_records, organizational_records) {
      var filtered_records, raw_records;
      raw_records = join_data(expenditure_records, organizational_records);
      filtered_records = filter_data(raw_records);
      window.records = filtered_records;
      chart = new BubbleChart(filtered_records);
      chart.start();
      return root.display_all();
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
      var $target, func;
      e.preventDefault();
      $target = $(e.target);
      func = $target.data('name');
      if (func === 'candidate') {
        window.get_chart().do_split(function(d) {
          return d.name;
        });
      }
      if (func === 'party') {
        window.get_chart().do_split(function(d) {
          return d.party;
        });
      }
      if (func === 'expenditure') {
        window.get_chart().do_split(function(d) {
          return d.super_category;
        });
      }
      if (func === 'office') {
        window.get_chart().do_split(function(d) {
          return d.office;
        });
      }
      if (func === 'amount') {
        return window.get_chart().split_amount();
      }
    });
    return queue().defer(d3.csv, "data/campaign_spending_summary.csv").defer(d3.csv, "data/organizational_report.csv").await(render_vis);
  });

}).call(this);
