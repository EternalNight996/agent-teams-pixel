/**
 * 挂机归属回归：只有当前打开对话的角色会累积挂机修为。
 * 其他成员/掌门在后台不涨，没有打开对话时任何人都不涨。
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

test('only the open member earns idle XP; teammates and captain do not', () => {
  withClock(({ advance }) => {
    const teams = [team('solo-a', 'cap-a', [{ id: 'm-a1', name: 'alpha' }, { id: 'm-a2', name: 'beta' }])]
    ingestCultivation(teams, 'm-a1')
    const before = {
      alpha: xpOf('member:alpha'),
      beta: xpOf('member:beta'),
      captain: xpOf('captain:solo-a'),
    }
    advance(10_000)
    ingestCultivation(teams, 'm-a1')
    assert.ok(xpOf('member:alpha') > before.alpha, 'the open member must gain')
    assert.equal(xpOf('member:beta'), before.beta, 'a background member must not gain')
    assert.equal(xpOf('captain:solo-a'), before.captain, 'the captain must not gain while a member is open')
  })
})

test('the open captain earns idle XP; members do not', () => {
  withClock(({ advance }) => {
    const teams = [team('solo-b', 'cap-b', [{ id: 'm-b1', name: 'gamma' }])]
    ingestCultivation(teams, 'cap-b')
    const memberBefore = xpOf('member:gamma')
    advance(20_000)
    ingestCultivation(teams, 'cap-b')
    assert.ok(xpOf('captain:solo-b') > 0, 'the open captain must gain')
    assert.equal(xpOf('member:gamma'), memberBefore, 'a member must not gain while the captain is open')
  })
})

test('idle XP does not accrue when no conversation is open', () => {
  withClock(({ advance }) => {
    const teams = [team('solo-c', 'cap-c', [{ id: 'm-c1', name: 'delta' }])]
    ingestCultivation(teams, undefined)
    advance(20_000)
    ingestCultivation(teams, undefined)
    assert.equal(xpOf('member:delta'), 0)
    assert.equal(xpOf('captain:solo-c'), 0)
  })
})

test('switching conversations never backfills time spent in another dialog', () => {
  withClock(({ advance }) => {
    const teams = [team('solo-d', 'cap-d', [{ id: 'm-d1', name: 'epsilon' }, { id: 'm-d2', name: 'zeta' }])]
    ingestCultivation(teams, 'm-d1')
    advance(10_000)
    ingestCultivation(teams, 'm-d1')
    const earned = xpOf('member:epsilon')
    assert.ok(earned > 0)

    // 在 epsilon 上离开 60 秒，然后切到 zeta：epsilon 不能拿到这 60 秒。
    advance(60_000)
    ingestCultivation(teams, 'm-d2')
    assert.equal(xpOf('member:epsilon'), earned)

    // 再切回 epsilon：从切换那一刻起算，切换本身不补记。
    advance(10_000)
    ingestCultivation(teams, 'm-d1')
    const back = xpOf('member:epsilon')
    assert.equal(back, earned)

    // 之后再停留 10 秒才正常增长。
    advance(10_000)
    ingestCultivation(teams, 'm-d1')
    assert.ok(xpOf('member:epsilon') > back)
  })
})
