import assert from 'node:assert/strict'
import test from 'node:test'
import {hallHasWork} from '../lib/client/hall-visibility.js'

test('a team without tasks owns no floating hall', () => {
  assert.equal(hallHasWork([]), false)
})

test('a team whose tasks were all cancelled owns no floating hall', () => {
  assert.equal(hallHasWork([{ state: 'cancelled' }, { state: 'cancelled' }]), false)
})

test('any non-cancelled task keeps the hall on screen', () => {
  for (const state of ['open', 'claimed', 'running', 'blocked', 'completed', 'failed']) {
    assert.equal(hallHasWork([{ state: 'cancelled' }, { state }]), true, state)
  }
})

test('one cancelled task among live work does not hide the hall', () => {
  assert.equal(hallHasWork([{ state: 'cancelled' }, { state: 'open' }]), true)
})
