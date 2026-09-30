/* agent-teams-pixel · 样板共用数据 + 像素头像 + 依赖关系工具（无依赖，浏览器直接跑） */
window.PX = (function () {
  // 团队 + 任务数据（4 套样板共用同一份，便于对比布局差异）
  var DATA = {
    teamName: '电商 App 重构',
    goal: '把下单链路拆成可验证的分工，交付可上线 v1',
    members: [
      { name: '领袖',       role: 'captain',      model: 'deepseek-v4', status: 'working', color: '#7c3aed' },
      { name: '需求分析师', role: 'requirements', model: 'deepseek-v4', status: 'working', color: '#3b82f6' },
      { name: '软件架构师', role: 'architecture', model: 'deepseek-v4', status: 'working', color: '#16a34a' },
      { name: '前端工程师', role: 'frontend',     model: 'deepseek-v4', status: 'working', color: '#22d3ee' },
      { name: '后端工程师', role: 'backend',      model: 'deepseek-v4', status: 'working', color: '#f59e0b' },
      { name: 'QA 测试',    role: 'verification', model: 'deepseek-v4', status: 'idle',    color: '#ef4444' },
      { name: '代码审查员', role: 'review',       model: 'deepseek-v4', status: 'idle',    color: '#ec4899' },
    ],
    tasks: [
      { id: 'T1', subject: '需求澄清', kind: 'requirements', status: 'completed', assignee: '需求分析师', deps: [],        model: 'deepseek-v4' },
      { id: 'T2', subject: '架构设计', kind: 'implementation', status: 'completed', assignee: '软件架构师', deps: ['T1'],      model: 'deepseek-v4' },
      { id: 'T3', subject: '前端实现', kind: 'implementation', status: 'running',   assignee: '前端工程师', deps: ['T2'],      model: 'deepseek-v4' },
      { id: 'T4', subject: '后端实现', kind: 'implementation', status: 'running',   assignee: '后端工程师', deps: ['T2'],      model: 'deepseek-v4' },
      { id: 'T5', subject: '联调测试', kind: 'verification',  status: 'blocked',   assignee: 'QA 测试',    deps: ['T3', 'T4'], model: 'deepseek-v4' },
      { id: 'T6', subject: '代码审查', kind: 'review',        status: 'open',      assignee: '代码审查员', deps: ['T5'],      model: 'deepseek-v4' },
      { id: 'T7', subject: '集成交付', kind: 'integration',   status: 'open',      assignee: '领袖',       deps: ['T6'],      model: 'deepseek-v4' },
    ],
  };

  var KIND_LABEL = {
    requirements: '需求', implementation: '实现', verification: '验证',
    review: '审查', repair: '修复', integration: '集成', architecture: '架构',
    frontend: '前端', backend: '后端', captain: '领袖',
  };

  var STATUS_LABEL = {
    running: '工作中', completed: '已完成', blocked: '阻塞', open: '待办', failed: '失败', idle: '空闲', working: '工作中',
  };

  function memberByName(name) {
    for (var i = 0; i < DATA.members.length; i++) if (DATA.members[i].name === name) return DATA.members[i];
    return null;
  }

  function statusInfo(status) {
    var map = {
      running: { cls: 'working', color: '#16a34a' },
      completed: { cls: 'done', color: '#3b82f6' },
      blocked: { cls: 'blocked', color: '#f59e0b' },
      open: { cls: 'open', color: '#64748b' },
      failed: { cls: 'failed', color: '#ef4444' },
    };
    return map[status] || map.open;
  }

  function kindLabel(kind) { return KIND_LABEL[kind] || kind || '工作'; }
  function statusLabel(status) { return STATUS_LABEL[status] || status; }

  // 依赖深度：无依赖 = 0，否则 1 + max(上游深度)。返回 {id: depth}
  function depths(tasks) {
    var byId = {}, d = {}, visiting = {};
    tasks.forEach(function (t) { byId[t.id] = t; });
    function depthOf(id) {
      if (d[id] !== undefined) return d[id];
      if (visiting[id]) return 0;
      var t = byId[id]; if (!t) return 0;
      visiting[id] = true;
      var dep = (t.deps || []).filter(function (x) { return byId[x]; });
      d[id] = dep.length === 0 ? 0 : 1 + Math.max.apply(null, dep.map(depthOf));
      visiting[id] = false;
      return d[id];
    }
    tasks.forEach(function (t) { depthOf(t.id); });
    return d;
  }

  // 上下游闭包（含自身），用于悬停高亮整条依赖链
  function related(taskId, tasks) {
    var byId = {}, dependents = {}, related = new Set(), seen = {};
    tasks.forEach(function (t) { byId[t.id] = t; });
    tasks.forEach(function (t) {
      (t.deps || []).forEach(function (dep) {
        (dependents[dep] = dependents[dep] || []).push(t.id);
      });
    });
    (function up(id) {
      if (seen['u' + id] || !byId[id]) return; seen['u' + id] = true; related.add(id);
      (byId[id].deps || []).forEach(up);
    })(taskId);
    (function down(id) {
      if (seen['d' + id] || !byId[id]) return; seen['d' + id] = true; related.add(id);
      (dependents[id] || []).forEach(down);
    })(taskId);
    return related;
  }

  // 像素小人头像：12×16 网格，unit=2px → viewBox 24×32
  function avatar(member) {
    var shirt = (member && member.color) || '#7c3aed';
    var hair = '#3a2d20';
    var skin = '#f5c98f';
    var u = 2, W = 12, cells = [];
    function px(x, y, c) {
      cells.push('<rect x="' + (x * u) + '" y="' + (y * u) + '" width="' + u + '" height="' + u + '" fill="' + c + '"/>');
    }
    for (var x = 0; x < W; x++) for (var y = 0; y < 3; y++) px(x, y, hair);   // 头发顶
    px(0, 3, hair); px(11, 3, hair); px(0, 4, hair); px(11, 4, hair);         // 鬓角
    for (var fy = 3; fy < 9; fy++) for (var fx = 1; fx < 11; fx++) px(fx, fy, skin); // 脸
    px(3, 6, '#14171f'); px(4, 6, '#14171f'); px(7, 6, '#14171f'); px(8, 6, '#14171f'); // 眼
    px(5, 7, '#c2544b'); px(6, 7, '#c2544b');                                 // 嘴
    px(4, 9, skin); px(5, 9, skin); px(6, 9, skin); px(7, 9, skin);           // 颈
    for (var by = 10; by < 16; by++) for (var bx = 2; bx < 10; bx++) px(bx, by, shirt); // 上衣
    cells.push('<rect x="4" y="28" width="16" height="4" fill="rgba(0,0,0,0.22)"/>');    // 衣摆阴影
    return '<svg class="px-avatar-svg" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" role="img" aria-label="' + (member && member.name ? member.name : '') + '">' + cells.join('') + '</svg>';
  }

  // 阶梯折线（像素风直角走线）：横向到中点 → 纵向 → 横向
  function steppedPath(x1, y1, x2, y2) {
    var mx = x1 + (x2 - x1) / 2;
    return 'M ' + x1 + ' ' + y1 + ' H ' + mx + ' V ' + y2 + ' H ' + x2;
  }

  // 高亮某任务的上下游链（悬停 / 固定共用）；传 null 清空
  function focusTask(root, taskId) {
    var rel = taskId ? related(taskId, DATA.tasks) : null;
    root.querySelectorAll('.px-node[data-task]').forEach(function (n) {
      var on = !!rel && rel.has(n.getAttribute('data-task'));
      n.classList.toggle('is-dim', !!rel && !on);
      n.classList.toggle('is-lit', on);
    });
    root.querySelectorAll('.px-edge').forEach(function (e) {
      var a = e.getAttribute('data-from'), b = e.getAttribute('data-to');
      var on = !!rel && rel.has(a) && rel.has(b);
      e.classList.toggle('is-dim', !!rel && !on);
      e.classList.toggle('is-lit', on);
    });
  }

  // 悬停高亮：进入聚焦，离开回到「固定态」（无固定则清空）
  function bindHighlight(root) {
    root.querySelectorAll('.px-node[data-task]').forEach(function (node) {
      node.addEventListener('mouseenter', function () { focusTask(root, node.getAttribute('data-task')); });
      node.addEventListener('mouseleave', function () { focusTask(root, pinned); });
    });
  }

  // 点击固定 / 取消固定：跨视图切换保留高亮
  var pinned = null;
  function bindPin(root) {
    root.querySelectorAll('.px-node[data-task]').forEach(function (node) {
      node.addEventListener('click', function () {
        var id = node.getAttribute('data-task');
        pinned = (pinned === id) ? null : id;
        applyPinned(root);
      });
    });
  }

  // 把「固定态」重新套到当前视图（切换视图后调用）
  function applyPinned(root) {
    root.querySelectorAll('.px-node[data-task]').forEach(function (n) {
      n.classList.toggle('is-pinned', n.getAttribute('data-task') === pinned);
    });
    focusTask(root, pinned);
  }

  // 生成任务节点 DOM（各样板复用同一张卡片，布局由外层决定）
  function taskNode(task) {
    var m = memberByName(task.assignee);
    var st = statusInfo(task.status);
    var el = document.createElement('div');
    el.className = 'px-node px-node--' + st.cls;
    el.setAttribute('data-task', task.id);
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', task.subject + ' / ' + statusLabel(task.status));
    el.title = task.subject + ' / ' + statusLabel(task.status) + ' / ' + (m ? m.name : '共享池');
    el.innerHTML =
      '<div class="px-node-id">' + task.id + '</div>' +
      '<div class="px-node-subject">' + task.subject + '</div>' +
      '<div class="px-node-meta">' +
        '<span class="px-badge px-badge--kind">' + kindLabel(task.kind) + '</span>' +
        '<span class="px-badge px-badge--' + st.cls + '">' + statusLabel(task.status) + '</span>' +
        (m ? '<span class="px-chip"><span class="px-avatar" style="width:15px;height:20px">' + avatar(m) + '</span>' + m.name + '</span>' : '') +
      '</div>';
    return el;
  }

  function progressBar() {
    var total = DATA.tasks.length;
    var done = DATA.tasks.filter(function (t) { return t.status === 'completed'; }).length;
    var running = DATA.tasks.filter(function (t) { return t.status === 'running'; }).length;
    var pct = Math.round(((done + running * 0.5) / total) * 100);
    return {
      html: '<div class="px-progress"><span>' + done + '/' + total + ' 完成</span>' +
        '<div class="px-progress-track"><div class="px-progress-fill' + (done === total ? ' is-done' : '') + '" style="width:' + pct + '%"></div></div>' +
        '<span>' + pct + '%</span></div>',
      pct: pct,
    };
  }

  function legend() {
    return '<div class="px-legend">' +
      ['running', 'completed', 'blocked', 'open'].map(function (s) {
        var st = statusInfo(s);
        return '<span class="px-badge px-badge--' + st.cls + '"><span class="px-dot px-dot--' + st.cls + '"></span>' + statusLabel(s) + '</span>';
      }).join('') +
      '<span class="px-hint">悬停看依赖链，点击固定，跨视图保留</span></div>';
  }

  // 悬停成员行 → 高亮该成员名下任务，其余变暗
  function bindMemberHighlight(root) {
    root.querySelectorAll('[data-member]').forEach(function (row) {
      var name = row.getAttribute('data-member');
      row.addEventListener('mouseenter', function () {
        root.querySelectorAll('.px-node[data-task]').forEach(function (n) {
          var t = DATA.tasks.find(function (x) { return x.id === n.getAttribute('data-task'); });
          n.classList.toggle('is-dim', !(t && t.assignee === name));
          if (t && t.assignee === name) n.classList.add('is-lit');
        });
      });
      row.addEventListener('mouseleave', function () {
        root.querySelectorAll('.is-dim').forEach(function (n) { n.classList.remove('is-dim'); });
        root.querySelectorAll('.is-lit').forEach(function (n) { n.classList.remove('is-lit'); });
      });
    });
  }

  function memberRow(member) {
    var st = statusInfo(member.status === 'working' ? 'running' : 'idle');
    var mine = DATA.tasks.filter(function (t) { return t.assignee === member.name && t.status !== 'completed'; }).length;
    var el = document.createElement('div');
    el.className = 'px-member' + (member.name === '领袖' ? ' is-lead' : '');
    el.setAttribute('data-member', member.name);
    el.innerHTML =
      '<span class="px-avatar">' + avatar(member) + '</span>' +
      (member.name === '领袖' ? '<span class="px-crown">★</span>' : '') +
      '<span class="px-member-name">' + member.name + '</span>' +
      '<span class="px-member-role">' + kindLabel(member.role) + '</span>' +
      '<span class="px-dot px-dot--' + st.cls + '" title="' + statusLabel(member.status) + '"></span>' +
      '<span class="px-member-model px-chip">' + member.model + '</span>' +
      (mine > 0 ? '<span class="px-badge px-badge--working">' + mine + ' 项</span>' : '');
    return el;
  }

  return {
    DATA: DATA,
    memberByName: memberByName,
    statusInfo: statusInfo,
    kindLabel: kindLabel,
    statusLabel: statusLabel,
    depths: depths,
    related: related,
    avatar: avatar,
    steppedPath: steppedPath,
    focusTask: focusTask,
    bindHighlight: bindHighlight,
    bindPin: bindPin,
    applyPinned: applyPinned,
    bindMemberHighlight: bindMemberHighlight,
    taskNode: taskNode,
    memberRow: memberRow,
    progressBar: progressBar,
    legend: legend,
  };
})();
