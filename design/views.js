/* agent-teams-pixel · 四种视图渲染器 + 一键切换（依赖 shared.js 的 window.PX） */
window.PX = window.PX || {};
(function () {
  var P = window.PX;

  function emptyState(root) {
    var e = document.createElement('div');
    e.className = 'px-empty';
    e.textContent = '当前会话还没有活动团队。先在工作角色页签选人，再点「一键编排」发起任务。';
    root.appendChild(e);
  }

  /* ============ 泳道 DAG ============ */
  function swimlane(root) {
    var D = P.DATA;
    var NW = 150, NH = 70, GAPX = 84, GAPY = 26, PAD = 30;
    var dep = P.depths(D.tasks);
    var cols = {}; D.tasks.forEach(function (t) { (cols[dep[t.id]] = cols[dep[t.id]] || []).push(t); });
    var keys = Object.keys(cols).sort(function (a, b) { return a - b; });
    var pos = {};
    keys.forEach(function (k, ci) { cols[k].forEach(function (t, ri) { pos[t.id] = { x: PAD + ci * (NW + GAPX), y: PAD + ri * (NH + GAPY) }; }); });
    var rows = keys.reduce(function (m, k) { return Math.max(m, cols[k].length); }, 0);
    var W = keys.length * (NW + GAPX) - GAPX + PAD * 2;
    var H = rows * (NH + GAPY) - GAPY + PAD * 2;

    var wrap = document.createElement('div');
    wrap.className = 'px-grid-bg';
    wrap.style.position = 'relative';
    wrap.style.width = W + 'px';
    wrap.style.height = H + 'px';

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'dag-svg');
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    D.tasks.forEach(function (t) {
      (t.deps || []).forEach(function (d) {
        var a = pos[d], b = pos[t.id];
        if (!a || !b) return;
        var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p.setAttribute('class', 'px-edge');
        p.setAttribute('data-from', d); p.setAttribute('data-to', t.id);
        p.setAttribute('d', P.steppedPath(a.x + NW, a.y + NH / 2, b.x, b.y + NH / 2));
        svg.appendChild(p);
      });
    });
    wrap.appendChild(svg);

    keys.forEach(function (k, ci) {
      var s = document.createElement('div');
      s.className = 'px-stage-label';
      s.style.position = 'absolute'; s.style.left = (PAD + ci * (NW + GAPX)) + 'px'; s.style.top = '4px';
      s.textContent = '阶段 ' + k;
      wrap.appendChild(s);
    });

    D.tasks.forEach(function (t) {
      var n = P.taskNode(t);
      n.style.position = 'absolute';
      n.style.left = pos[t.id].x + 'px'; n.style.top = pos[t.id].y + 'px';
      n.style.width = NW + 'px';
      wrap.appendChild(n);
    });

    var row = document.createElement('div');
    row.className = 'layout-row';
    row.appendChild(wrap);
    var side = document.createElement('div');
    side.className = 'member-side';
    var h = document.createElement('h3'); h.textContent = '成员 ' + D.members.length;
    side.appendChild(h);
    D.members.forEach(function (m) { side.appendChild(P.memberRow(m)); });
    row.appendChild(side);
    root.appendChild(row);
  }

  /* ============ 径向图 ============ */
  function radial(root) {
    var D = P.DATA;
    var W = 720, H = 720, CX = W / 2, CY = H / 2;
    var dep = P.depths(D.tasks);
    var maxDep = Math.max.apply(null, D.tasks.map(function (t) { return dep[t.id]; }));
    var taskRingBase = 130, taskRingStep = (CX - 60 - taskRingBase) / Math.max(1, maxDep + 1);
    var memberR = CX - 40;

    var wrap = document.createElement('div');
    wrap.className = 'px-grid-bg';
    wrap.style.position = 'relative';
    wrap.style.width = W + 'px';
    wrap.style.height = H + 'px';

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'radial-svg');
    svg.setAttribute('width', W); svg.setAttribute('height', H);

    var pos = {}, byDep = {};
    D.tasks.forEach(function (t) { (byDep[dep[t.id]] = byDep[dep[t.id]] || []).push(t); });
    Object.keys(byDep).forEach(function (k) {
      var list = byDep[k], r = taskRingBase + Number(k) * taskRingStep;
      list.forEach(function (t, i) {
        var ang = -Math.PI / 2 + (i / list.length) * Math.PI * 2;
        pos[t.id] = { x: CX + r * Math.cos(ang), y: CY + r * Math.sin(ang) };
      });
    });

    D.tasks.forEach(function (t) {
      (t.deps || []).forEach(function (d) {
        var a = pos[d], b = pos[t.id];
        if (!a || !b) return;
        var p = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        p.setAttribute('class', 'px-edge');
        p.setAttribute('data-from', d); p.setAttribute('data-to', t.id);
        p.setAttribute('x1', a.x); p.setAttribute('y1', a.y);
        p.setAttribute('x2', b.x); p.setAttribute('y2', b.y);
        svg.appendChild(p);
      });
    });
    wrap.appendChild(svg);

    var lead = D.members[0];
    var c = document.createElement('div');
    c.className = 'center-node';
    c.innerHTML = '<span class="px-avatar" style="width:44px;height:58px;display:block;margin:0 auto">' + P.avatar(lead) + '</span>' +
      '<div class="px-node-subject">' + lead.name + '</div>' +
      '<div class="px-chip">' + lead.model + '</div>';
    c.style.left = CX + 'px'; c.style.top = CY + 'px';
    wrap.appendChild(c);

    D.tasks.forEach(function (t) {
      var n = P.taskNode(t);
      n.className += ' radial-node';
      n.style.left = pos[t.id].x + 'px'; n.style.top = pos[t.id].y + 'px';
      wrap.appendChild(n);
    });

    var others = D.members.slice(1);
    others.forEach(function (m, i) {
      var ang = -Math.PI / 2 + (i / others.length) * Math.PI * 2;
      var row = P.memberRow(m);
      row.className += ' radial-node';
      row.style.left = (CX + memberR * Math.cos(ang)) + 'px';
      row.style.top = (CY + memberR * Math.sin(ang)) + 'px';
      row.style.width = '170px';
      wrap.appendChild(row);
    });

    root.appendChild(wrap);
  }

  /* ============ 时间轴（甘特） ============ */
  function timeline(root) {
    var D = P.DATA;
    var LB = 170, BARW = 118, GAPX = 44, LANEH = 64, TOP = 40;

    var byId = {}; D.tasks.forEach(function (t) { byId[t.id] = t; });
    var order = [], done = {}, visiting = {};
    function visit(id) {
      if (done[id] || !byId[id] || visiting[id]) return;
      visiting[id] = true; (byId[id].deps || []).forEach(visit);
      visiting[id] = false; done[id] = true; order.push(id);
    }
    D.tasks.forEach(function (t) { visit(t.id); });

    var xOf = {}; order.forEach(function (id, i) { xOf[id] = i; });
    var laneOf = {}; D.members.forEach(function (m, i) { laneOf[m.name] = i; });

    var W = LB + order.length * (BARW + GAPX) + 30;
    var H = TOP + D.members.length * LANEH + 10;
    var yOf = function (name) { return TOP + (laneOf[name] || 0) * LANEH + 12; };

    var wrap = document.createElement('div');
    wrap.className = 'timeline';
    wrap.style.width = W + 'px';
    wrap.style.height = H + 'px';

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'tl-svg');
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    D.members.forEach(function (m, i) {
      var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('class', 'px-edge');
      line.setAttribute('x1', 0); line.setAttribute('x2', W);
      var y = TOP + (i + 1) * LANEH;
      line.setAttribute('y1', y); line.setAttribute('y2', y);
      svg.appendChild(line);
    });
    D.tasks.forEach(function (t) {
      (t.deps || []).forEach(function (d) {
        var a = byId[d]; if (!a) return;
        var x1 = LB + xOf[d] * (BARW + GAPX) + BARW, y1 = yOf(a.assignee) + 20;
        var x2 = LB + xOf[t.id] * (BARW + GAPX), y2 = yOf(t.assignee) + 20;
        var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p.setAttribute('class', 'px-edge');
        p.setAttribute('data-from', d); p.setAttribute('data-to', t.id);
        p.setAttribute('d', P.steppedPath(x1, y1, x2, y2));
        svg.appendChild(p);
      });
    });
    wrap.appendChild(svg);

    D.members.forEach(function (m, i) {
      var lab = document.createElement('div');
      lab.className = 'tl-label';
      lab.style.left = '8px'; lab.style.top = (TOP + i * LANEH + 8) + 'px';
      lab.style.width = (LB - 16) + 'px';
      lab.innerHTML = '<span class="px-avatar" style="width:24px;height:32px">' + P.avatar(m) + '</span>' +
        '<span class="px-member-name">' + m.name + '</span>' +
        '<span class="px-dot px-dot--' + (m.status === 'working' ? 'working' : 'idle') + '"></span>';
      lab.setAttribute('data-member', m.name);
      wrap.appendChild(lab);
    });

    order.forEach(function (id, i) {
      var tick = document.createElement('div');
      tick.className = 'tl-tick';
      tick.style.left = (LB + i * (BARW + GAPX)) + 'px';
      tick.textContent = id;
      wrap.appendChild(tick);
    });

    D.tasks.forEach(function (t) {
      var n = P.taskNode(t);
      n.className += ' tl-bar';
      n.style.left = (LB + xOf[t.id] * (BARW + GAPX)) + 'px';
      n.style.top = yOf(t.assignee) + 'px';
      wrap.appendChild(n);
    });

    var scroller = document.createElement('div');
    scroller.className = 'timeline-wrap px-grid-bg';
    scroller.appendChild(wrap);
    root.appendChild(scroller);
  }

  /* ============ 看板 ============ */
  function kanban(root) {
    var D = P.DATA;
    var cols = [
      { key: 'open', label: '待办' },
      { key: 'running', label: '进行中' },
      { key: 'blocked', label: '阻塞' },
      { key: 'completed', label: '已完成' },
    ];
    var byStatus = {};
    D.tasks.forEach(function (t) { (byStatus[t.status] = byStatus[t.status] || []).push(t); });

    function card(t) {
      var m = P.memberByName(t.assignee);
      var st = P.statusInfo(t.status);
      var el = document.createElement('div');
      el.className = 'px-node px-node--' + st.cls;
      el.setAttribute('data-task', t.id);
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', t.subject + ' / ' + P.statusLabel(t.status));
      el.title = t.subject + ' / ' + P.statusLabel(t.status);
      var deps = (t.deps || []).map(function (d) {
        var dt = D.tasks.find(function (x) { return x.id === d; });
        var miss = !dt || dt.status !== 'completed';
        return '<span class="dep-chip' + (miss ? ' is-miss' : '') + '">' + (miss ? '等待 ' : '✓ ') + d + '</span>';
      }).join('');
      el.innerHTML =
        '<div class="px-node-id">' + t.id + ' · <span class="px-badge px-badge--kind">' + P.kindLabel(t.kind) + '</span></div>' +
        '<div class="px-node-subject">' + t.subject + '</div>' +
        (m ? '<div class="board-card-owner"><span class="px-avatar" style="width:22px;height:29px">' + P.avatar(m) + '</span>' +
          '<span class="px-member-name" style="font-size:15px">' + m.name + '</span>' +
          '<span class="px-chip">' + t.model + '</span></div>' : '') +
        '<div class="board-deps">' + deps + '</div>';
      return el;
    }

    var board = document.createElement('div');
    board.className = 'board';
    cols.forEach(function (c) {
      var col = document.createElement('div');
      col.className = 'board-col';
      var st = P.statusInfo(c.key);
      col.innerHTML = '<div class="board-col-head"><span class="px-dot px-dot--' + st.cls + '"></span>' + c.label +
        '<span class="board-count">' + (byStatus[c.key] || []).length + '</span></div>';
      (byStatus[c.key] || []).forEach(function (t) { col.appendChild(card(t)); });
      if (!(byStatus[c.key] || []).length) {
        var e = document.createElement('div');
        e.className = 'px-hint'; e.style.textAlign = 'center'; e.style.padding = '12px 0';
        e.textContent = '（空）';
        col.appendChild(e);
      }
      board.appendChild(col);
    });
    root.appendChild(board);
  }

  var VIEWS = { swimlane: swimlane, radial: radial, timeline: timeline, kanban: kanban };

  // 渲染某视图到 root，并绑定交互 + 恢复固定态
  function renderView(name, root) {
    root.innerHTML = '';
    if (!P.DATA.tasks || P.DATA.tasks.length === 0) { emptyState(root); return; }
    try {
      VIEWS[name](root);
    } catch (err) {
      var e = document.createElement('div');
      e.className = 'px-error';
      e.textContent = '视图渲染失败：' + (err && err.message ? err.message : err);
      root.appendChild(e);
      return;
    }
    P.bindHighlight(root);
    P.bindMemberHighlight(root);
    P.bindPin(root);
    P.applyPinned(root);
  }

  P.views = VIEWS;
  P.renderView = renderView;
})();
