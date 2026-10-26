/**
 * 挂机归属回归：当前对话面板所属宗门的掌门 + 全部修士一起累积；
 * 其他宗门不涨；正在对话的角色额外吃连击；换面板不补记。
 */
import assert from 'node:assert/strict'
import test from 'node:test'
import { ingestCultivation, xpOf } from '../lib/client/cultivation-store.js'

const team = (name, captainSessionId, members) => ({
  workspace: '',
  teamId: name,
  name,
  captainSessionId,
  phase: 'running',
  members: members.map(({ id, name: memberName }) => ({ id, name: memberName, status: 'working', joinedAt: 1 })),
  tasks: [],
  messageCount: 0,
  captainInbox: [],
})

/** 用可控时钟跑 ingest，避免依赖真实时间。 */
function withClock(run) {
  const realNow = Date.now
  let now = 1_700_000_000_000
  Date.now = () => now
  try {
    return run({ advance: ms => { now += ms } })
  } finally {
    Date.now = realNow
  }
}

test('every cultivator in the current panel earns idle XP; another sect does not', () => {
  withClock(({ advance }) => {
    const teams = [
      team('panel-a', 'cap-a', [{ id: 'a1', name: 'alpha' }, { id: 'a2', name: 'beta' }]),
      team('panel-b', 'cap-b', [{ id: 'b1', name: 'gamma' }]),
    ]
    ingestCultivation(teams, 'cap-a')
    const before = {
      captain: xpOf('captain:panel-a'),
      alpha: xpOf('member:alpha'),
      beta: xpOf('member:beta'),
      gamma: xpOf('member:gamma'),
    }
    advance(10_000)
    ingestCultivation(teams, 'cap-a')
    assert.ok(xpOf('captain:panel-a') > before.captain, 'the panel captain must gain')
    assert.ok(xpOf('member:alpha') > before.alpha, 'panel member alpha must gain')
    assert.ok(xpOf('member:beta') > before.beta, 'panel member beta must gain')
    assert.equal(xpOf('member:gamma'), before.gamma, 'another sect must not gain')
  })
})

test('the active member gets the streak bonus over the rest of the panel', () => {
  withClock(({ advance }) => {
    const teams = [team('panel-c', 'cap-c', [{ id: 'c1', name: 'delta' }, { id: 'c2', name: 'epsilon' }])]
    ingestCultivation(teams, 'c1')
    for (let tick = 0; tick < 12; tick += 1) {
      advance(10_000)
      ingestCultivation(teams, 'c1')
    }
    assert.ok(xpOf('member:delta') > 0)
    assert.ok(xpOf('member:delta') > xpOf('member:epsilon'), 'the speaker must out-earn a background member')
    assert.ok(xpOf('member:epsilon') > 0, 'background member still earns base idle')
  })
})

test('no open conversation means nobody earns idle XP', () => {
  withClock(({ advance }) => {
    const teams = [team('panel-d', 'cap-d', [{ id: 'd1', name: 'zeta' }])]
    ingestCultivation(teams, undefined)
    advance(20_000)
    ingestCultivation(teams, undefined)
    assert.equal(xpOf('member:zeta'), 0)
    assert.equal(xpOf('captain:panel-d'), 0)
  })
})

test('switching panels does not backfill the incoming sect', () => {
  withClock(({ advance }) => {
    const teams = [
      team('panel-e', 'cap-e', [{ id: 'e1', name: 'eta' }]),
      team('panel-f', 'cap-f', [{ id: 'f1', name: 'theta' }]),
    ]
    ingestCultivation(teams, 'cap-e')
    advance(10_000)
    ingestCultivation(teams, 'cap-e')
    const eta = xpOf('member:eta')
    assert.ok(eta > 0)

    advance(60_000)
    ingestCultivation(teams, 'cap-f')
    assert.equal(xpOf('member:eta'), eta, 'the old panel stops earning when switched away')

    advance(10_000)
    ingestCultivation(teams, 'cap-e')
    const back = xpOf('member:eta')
    assert.equal(back, eta, 'switching back must not backfill the away time')

    advance(10_000)
    ingestCultivation(teams, 'cap-e')
    assert.ok(xpOf('member:eta') > back, 'the panel earns again after the switch')
  })
})
