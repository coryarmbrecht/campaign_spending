(function() {
  var BubbleChart, CandidateModal, campaignInit, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  BubbleChart = (function() {
    function BubbleChart(data) {
      this.hide_details = __bind(this.hide_details, this);
      this.show_details = __bind(this.show_details, this);
      this.move_towards_year = __bind(this.move_towards_year, this);
      this.estimate_circle_diameter = __bind(this.estimate_circle_diameter, this);
      this.get_candidate_short_name = __bind(this.get_candidate_short_name, this);
      this.get_supercategory = __bind(this.get_supercategory, this);
      this.move_to_location_map = __bind(this.move_to_location_map, this);
      this.move_towards_candidates = __bind(this.move_towards_candidates, this);
      this.format_money_millions = __bind(this.format_money_millions, this);
      this.do_split = __bind(this.do_split, this);
      this.show_viz_type = __bind(this.show_viz_type, this);
      this.split_amount = __bind(this.split_amount, this);
      this.move_towards_center = __bind(this.move_towards_center, this);
      this.display_group_all = __bind(this.display_group_all, this);
      this.create_circles = __bind(this.create_circles, this);
      this.create_vis = __bind(this.create_vis, this);
      this.update_data = __bind(this.update_data, this);
      this.kill_forces = __bind(this.kill_forces, this);
      this.create_nodes = __bind(this.create_nodes, this);
      var max_amount;
      this.data = data;
      this.width = 1350;
      this.height = 3500;
      this.tooltip = CustomTooltip("expenditure_tooltip", 300);
      this.damper = 0.1;
      this.vis = null;
      this.nodes = [];
      this.forces = [];
      this.circles = null;
      max_amount = 1173620 * 1.21;
      this.radius_scale = d3.scale.pow().exponent(0.5).domain([0, max_amount]).range([2, 85]);
      console.log('max_amount ' + max_amount);
      console.log(this.radius_scale);
      this.create_nodes(this.data);
      this.create_vis();
    }

    BubbleChart.prototype.create_nodes = function(data) {
      this.nodes = [];
      data.forEach((function(_this) {
        return function(d) {
          var node, radius;
          node = {
            id: d.id,
            radius: _this.radius_scale(parseInt(d.amount)),
            value: parseFloat(d.amount),
            name: d.candidate_name,
            org: 'org',
            group: 'group',
            party: d.party,
            reg_no: d.reg_no,
            category: d.expenditure_category,
            super_category: _this.get_supercategory(d.expenditure_category),
            office: d.office,
            election_period: d.election_period,
            election_year: d.election_period.split('-')[1],
            x: Math.random() * 1,
            y: Math.random() * 800
          };
          radius = _this.radius_scale(parseInt(d.amount));
          if (radius < 0) {
            console.log("Radius less than 0 for node! " + JSON.stringify(node));
          }
          return _this.nodes.push(node);
        };
      })(this));
      this.nodes.sort(function(a, b) {
        return b.value - a.value;
      });
      return window.nodes = this.nodes;
    };

    BubbleChart.prototype.kill_forces = function() {
      return this.forces.forEach((function(_this) {
        return function(force) {
          force.stop();
          return force.nodes([]);
        };
      })(this));
    };

    BubbleChart.prototype.update_data = function(records) {
      var func;
      this.kill_forces();
      this.create_nodes(records);
      this.create_circles();
      func = $('.viz_nav.btn.selected').data('name');
      if (func == null) {
        func = 'year';
      }
      console.log("func is " + func);
      return this.show_viz_type(func);
    };

    BubbleChart.prototype.create_vis = function() {
      this.vis = d3.select("#vis").append("svg").attr("width", this.width).attr("height", this.height).attr("id", "svg_vis");
      return this.create_circles();
    };

    BubbleChart.prototype.create_circles = function() {
      var that;
      this.circles = this.vis.selectAll("circle").data(this.nodes, function(d) {
        return d.id;
      });
      that = this;
      this.circles.enter().append("circle").attr("r", 0).attr('class', (function(_this) {
        return function(d) {
          return "" + (_this.get_supercategory(d.category)) + " " + d.reg_no;
        };
      })(this)).attr("stroke-width", 2).attr('x', 1000).attr('y', 1000).attr("id", function(d) {
        return "bubble_" + d.id;
      }).on("mouseover", function(d, i) {
        that.show_details(d, i, this);
        return that.circles.filter((function(_this) {
          return function(circle) {
            return circle.reg_no !== d.reg_no;
          };
        })(this)).transition().duration(1000).style('opacity', 0.3);
      }).on("mouseout", function(d, i) {
        that.hide_details(d, i, this);
        return that.circles.transition().duration(1000).style('opacity', 1);
      }).transition().duration(3000).attr("r", function(d) {
        return d.radius;
      });
      return this.circles.exit().remove();
    };

    BubbleChart.prototype.charge = function(d) {
      return -(Math.pow(d.radius, 2.0) / 7) + -(d.radius * 0.1) + -.3;
    };

    BubbleChart.prototype.display_group_all = function() {
      var center_label, force, formatted_total, radius, titles, total_amount;
      this.kill_forces();
      force = d3.layout.force().nodes(this.nodes).size([this.width, this.height]);
      this.forces = [force];
      radius = this.estimate_circle_diameter(this.nodes) / 2;
      this.center = {
        x: this.width / 2,
        y: radius + 80
      };
      force.gravity(0).theta(1.1).charge(this.charge).chargeDistance(Infinity).friction(0.9).on("tick", (function(_this) {
        return function(e) {
          return _this.circles.each(_this.move_towards_center(e.alpha)).attr("cx", function(d) {
            return d.x;
          }).attr("cy", function(d) {
            return d.y;
          });
        };
      })(this));
      force.start();
      total_amount = d3.sum(this.nodes, function(d) {
        return d.value;
      });
      formatted_total = this.format_money_millions(total_amount);
      center_label = [
        {
          text: 'Total Campaign Spending',
          "class": 'header',
          dx: radius + 30,
          dy: 80
        }, {
          text: formatted_total,
          "class": 'amount',
          dx: radius + 30,
          dy: 100
        }
      ];
      titles = this.vis.selectAll('text.titles').remove();
      titles = this.vis.selectAll('text.titles').data(center_label, function(d) {
        return d.text;
      });
      titles.enter().append('text').text(function(d) {
        return d.text;
      }).attr('class', (function(_this) {
        return function(d) {
          return "titles year " + d["class"];
        };
      })(this)).attr('x', (function(_this) {
        return function(d) {
          return _this.center.x + d.dx;
        };
      })(this)).attr('y', (function(_this) {
        return function(d) {
          return _this.center.y + d.dy;
        };
      })(this));
      return titles.exit().remove();
    };

    BubbleChart.prototype.move_towards_center = function(alpha) {
      return (function(_this) {
        return function(d) {
          d.x = d.x + (_this.center.x - d.x) * (_this.damper + 0.02) * alpha;
          return d.y = d.y + (_this.center.y - d.y) * (_this.damper + 0.02) * alpha;
        };
      })(this);
    };

    BubbleChart.prototype.split_amount = function() {};

    BubbleChart.prototype.show_viz_type = function(func) {
      var accessor, sort_func;
      if (func === 'candidate') {
        this.do_split(function(d) {
          return d.name;
        });
      }
      if (func === 'party') {
        this.do_split(function(d) {
          return d.party;
        });
      }
      if (func === 'expenditure') {
        accessor = function(d) {
          return d.super_category;
        };
        this.do_split(accessor, {
          charge: (function(_this) {
            return function(d) {
              return _this.charge(d) * 1.3;
            };
          })(this)
        });
      }
      if (func === 'office') {
        this.do_split(function(d) {
          return d.office;
        });
      }
      if (func === 'amount') {
        console.log('do nothing');
        accessor = function(d) {
          if (d.value > 1e6) {
            return "Over a million";
          } else if (d.value > 500000) {
            return "$500,000 to 1 million";
          } else if (d.value > 250000) {
            return "$250,000 to 500,000";
          } else if (d.value > 200000) {
            return "$200,000 to $250,000";
          } else if (d.value > 150000) {
            return "$150,000 to 200,000";
          } else if (d.value > 100000) {
            return "$100,000 to 150,000";
          } else if (d.value > 50000) {
            return "$50,000 to 100,000";
          } else if (d.value > 25000) {
            return "$25,000 to 50,000";
          } else if (d.value > 20000) {
            return "$20,000 to 25,000";
          } else if (d.value > 15000) {
            return "$15,000 to 20,000";
          } else if (d.value > 10000) {
            return "$10,000 to 15,000";
          } else if (d.value > 5000) {
            return "$5,000 to 10,000";
          } else if (d.value > 1000) {
            return "$1,000 to 5,000";
          } else {
            return "< $1,000";
          }
        };
        sort_func = function(a, b) {
          var get_amount;
          get_amount = function(d) {
            var $_pos, amount_str, end_pos;
            $_pos = d.indexOf('$') + 1;
            end_pos = d.indexOf(' ', $_pos);
            amount_str = d.substring($_pos, end_pos);
            return parseInt(amount_str.replace(/,/g, ''));
          };
          if (a === "Over a million") {
            return -1;
          }
          if (b === "Over a million") {
            return 1;
          }
          if (a === "< $1,000") {
            return 1;
          }
          if (b === "< $1,000") {
            return -1;
          }
          console.log("a " + a + "\tb " + b);
          console.log("a " + (get_amount(a)) + "\tb " + (get_amount(b)));
          console.log("");
          return d3.descending(get_amount(a), get_amount(b));
        };
        this.do_split(accessor, {
          sort: sort_func,
          view_by_amount: true
        });
      }
      if (func === 'year') {
        return this.display_group_all();
      }
    };

    BubbleChart.prototype.do_split = function(accessor, options) {
      var charge, force_map, line_height, line_offset, location_map, padding, titles;
      if (options == null) {
        options = {};
      }
      location_map = this.move_to_location_map(this.nodes, accessor, options);
      charge = options.charge != null ? options.charge : this.charge;
      this.kill_forces();
      this.forces = [];
      force_map = location_map.keys().map((function(_this) {
        return function(key) {
          var force, nodes;
          nodes = _this.nodes.filter(function(d) {
            return key === accessor(d);
          });
          force = d3.layout.force().nodes(nodes).size([_this.width, _this.height]);
          _this.forces.push(force);
          return {
            force: force,
            key: key,
            nodes: nodes
          };
        };
      })(this));
      force_map.forEach((function(_this) {
        return function(force) {
          var circles;
          circles = _this.vis.selectAll("circle").filter(function(d) {
            return force.key === accessor(d);
          });
          force.force.gravity(0).theta(1.0).charge(charge).chargeDistance(Infinity).friction(0.87).on("tick", function(e) {
            return circles.each(_this.move_towards_candidates(e.alpha, location_map, accessor)).attr('cx', function(d) {
              return d.x;
            }).attr('cy', function(d) {
              return d.y;
            });
          });
          return force.force.start();
        };
      })(this));
      titles = this.vis.selectAll('text.titles').remove();
      titles = this.vis.selectAll('text.titles').data(location_map.values(), function(d) {
        return d.key;
      });
      padding = options.view_by_amount != null ? padding = 90 : padding = 55;
      line_height = 20;
      line_offset = function(d, line_num) {
        return d.y + d.radius + padding + line_height * line_num;
      };
      titles.enter().append('text').attr("class", "titles header").text(function(d) {
        return d.key;
      }).attr("text-anchor", "middle").attr('x', function(d) {
        return d.x;
      }).attr('y', function(d) {
        return line_offset(d, 0);
      });
      titles.enter().append('text').attr('class', 'titles amount').text((function(_this) {
        return function(d) {
          return _this.format_money_millions(parseFloat(d.sum));
        };
      })(this)).attr('text-anchor', 'middle').attr('x', function(d) {
        return d.x;
      }).attr('y', function(d) {
        return line_offset(d, 1);
      });
      return titles.exit().remove();
    };

    BubbleChart.prototype.format_money_millions = function(amount_in_dollars) {
      var amount_in_millions;
      amount_in_millions = amount_in_dollars / 1e6;
      if (amount_in_millions <= 0.01) {
        return "< $0.01 million";
      } else {
        return d3.format('$,.2f')(amount_in_millions) + ' million';
      }
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

    BubbleChart.prototype.move_to_location_map = function(nodes, grouping_func, options) {
      var col_num, get_height, get_width, groupings_per_row, groups, label_padding, max_num_in_row, max_num_rows, min_grouping_height, min_grouping_width, num_in_row, padding, prev_radius, prev_y, sort;
      if (options == null) {
        options = {};
      }
      min_grouping_width = 300;
      groupings_per_row = Math.floor(this.width / min_grouping_width) - 1;
      min_grouping_height = 450;
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
            candidates: d3.set(leaves.map(_this.get_candidate_short_name)).values(),
            radius: _this.estimate_circle_diameter(leaves) / 2
          };
        };
      })(this)).map(nodes, d3.map);
      max_num_rows = 5;
      padding = options.view_by_amount != null ? 80 : 30;
      label_padding = 90;
      col_num = prev_radius = 0;
      num_in_row = 1;
      max_num_in_row = 6;
      prev_y = options.view_by_amount != null ? -90 : -60;
      sort = options.sort != null ? options.sort : function(a, b) {
        return d3.descending(parseFloat(groups.get(a).sum), parseFloat(groups.get(b).sum));
      };
      groups.keys().sort(sort).forEach((function(_this) {
        return function(key, index) {
          var entry, min_width, num_left_in_layout, prev_num_in_row, x, y;
          entry = groups.get(key);
          entry['key'] = key;
          if (col_num >= num_in_row) {
            col_num = 0;
          }
          if (col_num === 0) {
            prev_num_in_row = num_in_row;
            while ((_this.width / num_in_row) > entry.radius * 2 + padding * 3) {
              num_in_row += 1;
            }
            num_in_row -= 1;
            num_left_in_layout = groups.keys().length - index;
            if (num_in_row > num_left_in_layout) {
              if (!(num_left_in_layout > groups.keys().length - 1)) {
                num_in_row = prev_num_in_row;
              }
            }
            num_in_row = Math.min(max_num_in_row, num_in_row);
          }
          min_width = _this.width / num_in_row;
          x = min_width * col_num + min_width / 2;
          if (col_num === 0) {
            y = prev_y + prev_radius + entry.radius + padding * 2 + label_padding;
            prev_y = y;
            prev_radius = entry.radius;
          }
          y = prev_y;
          entry['x'] = x;
          entry['y'] = y;
          entry['radius'] = prev_radius;
          groups.set(key, entry);
          return col_num += 1;
        };
      })(this));
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

    BubbleChart.prototype.estimate_circle_diameter = function(nodes) {
      var area, diameter, estimated_diameter;
      area = d3.sum(nodes, function(d) {
        return Math.PI * Math.pow(d.radius, 2);
      });
      diameter = 2 * Math.sqrt(area / Math.PI);
      estimated_diameter = (Math.log(nodes.length) / 140 + 1) * diameter;
      return estimated_diameter;
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
      content += "<span class=\"office\">" + data.election_year + ", " + data.office + "</span><br/>";
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

  CandidateModal = (function() {
    function CandidateModal(data, i, element) {
      var matched, reg_no;
      reg_no = data.reg_no;
      matched = window.records.filter(function(d) {
        return d.reg_no === reg_no;
      });
      debugger;
    }

    CandidateModal.prototype.render = function() {
      var modal;
      modal = $('#candidate_modal');
      return modal.foundation('reveal', 'open');
    };

    return CandidateModal;

  })();

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  campaignInit = function() {
    $('.legend_hover_area').on('mouseenter', function() {
      return $('.legend').animate({
        right: 0
      });
    });
    return $('.legend').on('mouseleave', function() {
      return $('.legend').animate({
        right: '-225px'
      });
    });
  };

  $(function() {
    var chart, filter_data, join_data, render_vis;
    chart = null;
    campaignInit();
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
    filter_data = function(records, year) {
      var filtered_csv, reduced, sorted;
      filtered_csv = records.filter(function(d) {
        if (parseInt(d.amount) < 0) {
          return false;
        } else if (year === 2014) {
          return d.election_period === '2012-2014';
        } else if (year === 2012) {
          return d.election_period === '2010-2012';
        } else if (year === 2010) {
          return d.election_period === '2008-2010';
        } else if (year === 2008) {
          return d.election_period === '2006-2008';
        } else {
          return false;
        }
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
    root.update_year = function(next) {
      var $year_el, cur_year, direction, filtered_records, next_year, range, records;
      records = window.raw_records;
      $year_el = $('.viz_nav.year');
      cur_year = $year_el.data('year');
      direction = next ? 1 : -1;
      next_year = cur_year + 2 * direction;
      if (next_year === 2008) {
        $('.time_nav.left').animate({
          color: '#bcbbb4'
        }).removeClass('clickable');
      } else {
        $('.time_nav.left').animate({
          color: '#454542'
        }).addClass('clickable');
      }
      if (next_year === 2014) {
        $('.time_nav.right').animate({
          color: '#bcbbb4'
        }).removeClass('clickable');
      } else {
        $('.time_nav.right').animate({
          color: '#454542'
        }).addClass('clickable');
      }
      range = d3.range(2008, 2014.1, 2);
      if (__indexOf.call(range, next_year) < 0) {
        return;
      }
      $year_el.animate({
        color: 'white'
      }, {
        complete: function() {
          $year_el.text(next_year);
          $year_el.data('year', next_year);
          return $year_el.animate({
            color: '#454542'
          });
        }
      });
      filtered_records = filter_data(records, next_year);
      window.debug_now = true;
      window.records = filtered_records;
      return chart.update_data(filtered_records);
    };
    render_vis = function(error, expenditure_records, organizational_records) {
      var filtered_records, raw_records;
      raw_records = join_data(expenditure_records, organizational_records);
      window.raw_records = raw_records;
      filtered_records = filter_data(raw_records, 2014);
      window.records = filtered_records;
      chart = new BubbleChart(filtered_records);
      return chart.display_group_all();
    };
    root.get_chart = (function(_this) {
      return function() {
        return chart;
      };
    })(this);
    $('#viz_nav_container .viz_nav').on('click', function(e) {
      var $viz_nav, currentFunc, func;
      e.preventDefault();
      $viz_nav = $(e.target).closest('.viz_nav');
      func = $viz_nav.data('name');
      currentFunc = $('.viz_nav.btn.selected').data('name');
      $viz_nav.animate({
        backgroundColor: '#73884f'
      });
      $viz_nav.animate({
        backgroundColor: '#FFFFFF'
      });
      if (func !== currentFunc) {
        $viz_nav.siblings('.btn').removeClass('selected');
        $viz_nav.addClass('selected');
        return window.get_chart().show_viz_type(func);
      } else {
        $viz_nav.removeClass('selected');
        return window.get_chart().show_viz_type('year');
      }
    });
    $('.time_nav.right').on('click', function(e) {
      if ($(this).hasClass('clickable')) {
        return window.update_year(true);
      }
    });
    $('.time_nav.left').on('click', function(e) {
      if ($(this).hasClass('clickable')) {
        return window.update_year(false);
      }
    });
    return queue().defer(d3.csv, "data/campaign_spending_summary.csv").defer(d3.csv, "data/organizational_report.csv").await(render_vis);
  });

}).call(this);
