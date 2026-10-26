/**
 * 挂机归属回归：全队都吃挂机修为，当前对话角色额外吃连击倍率。
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

test('every member and the captain accrue idle XP, not only the open conversation', () => {
  withClock(({ advance }) => {
    const teams = [team('挂机宗甲', 'cap-a', [{ id: 'm-a1', name: '甲一' }, { id: 'm-a2', name: '甲二' }])]
    ingestCultivation(teams, 'cap-a') // 第一次只初始化 idleAt
    const before = {
      a1: xpOf('member:甲一'),
      a2: xpOf('member:甲二'),
      captain: xpOf('captain:挂机宗甲'),
    }
    advance(10_000)
    ingestCultivation(teams, 'cap-a')
    assert.ok(xpOf('member:甲一') > before.a1, '非当前对话的成员也要涨修为')
    assert.ok(xpOf('member:甲二') > before.a2, '第二位成员也要涨修为')
    assert.ok(xpOf('captain:挂机宗甲') > before.captain, '掌门挂机也要涨修为')
  })
})

test('the open conversation keeps the streak bonus over background teammates', () => {
  withClock(({ advance }) => {
    const teams = [team('挂机宗乙', 'cap-b', [{ id: 'm-b1', name: '乙一' }])]
    ingestCultivation(teams, 'm-b1') // 打开的是成员乙一
    for (let tick = 0; tick < 12; tick += 1) {
      advance(10_000)
      ingestCultivation(teams, 'm-b1')
    }
    const open = xpOf('member:乙一')
    const captain = xpOf('captain:挂机宗乙')
    assert.ok(open > 0)
    assert.ok(captain > 0, '掌门在后台也挂机')
    assert.ok(open > captain, `当前对话应吃连击加成（open=${open}, captain=${captain}）`)
  })
})

test('idle XP keeps accruing even when no conversation is open', () => {
  withClock(({ advance }) => {
    const teams = [team('挂机宗丙', 'cap-c', [{ id: 'm-c1', name: '丙一' }])]
    ingestCultivation(teams, undefined)
    const before = xpOf('member:丙一')
    advance(20_000)
    ingestCultivation(teams, undefined)
    assert.ok(xpOf('member:丙一') > before)
  })
})
