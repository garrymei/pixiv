const test = require('node:test')
const assert = require('node:assert/strict')
const { AppSettingsService } = require('../dist/modules/app-settings/app-settings.service')
const { LikesService } = require('../dist/modules/likes/likes.service')
const { CommentsService } = require('../dist/modules/comments/comments.service')

function fixture(initialEnabled) {
  const record = { id: 1, publishEnabled: initialEnabled }
  const settings = new AppSettingsService({ findOne: async () => record })
  let liked = false
  const comments = []
  let accesses = 0
  const touch = (value) => { accesses++; return value }
  const post = { id: 1, moderationStatus: 'APPROVED', likeCount: 0 }
  const postsRepo = {
    findOne: async () => touch(post),
    increment: async () => touch(undefined),
    save: async (value) => touch(value)
  }
  const likesRepo = {
    findOne: async () => touch(liked ? { postId: 1, userId: 2 } : null),
    create: (value) => touch(value),
    save: async () => { touch(); liked = true },
    remove: async () => { touch(); liked = false },
    count: async () => touch(liked ? 1 : 0)
  }
  const commentsRepo = {
    create: (value) => touch(value),
    save: async (value) => { touch(); comments.push(value); return { id: 1, ...value } }
  }
  return {
    record, comments,
    accesses: () => accesses,
    likes: new LikesService(likesRepo, postsRepo, settings),
    commentService: new CommentsService(commentsRepo, postsRepo, { findOne: async () => ({ id: 2 }) }, settings)
  }
}

for (const operation of ['like', 'unlike', 'comment']) {
  test(`disabled switch blocks ${operation} before accessing engagement data`, async () => {
    const f = fixture(0)
    const action = operation === 'comment'
      ? () => f.commentService.create(2, { post_id: 1, content: 'test' })
      : () => f.likes[operation](1, 2)
    await assert.rejects(action, (error) => error.getStatus() === 403)
    assert.equal(f.accesses(), 0)
  })
}

test('enabled switch permits like, unlike and comment', async () => {
  const f = fixture(1)
  assert.deepEqual(await f.likes.like(1, 2), { liked: true, like_count: 1 })
  assert.deepEqual(await f.likes.unlike(1, 2), { liked: false, like_count: 0 })
  const comment = await f.commentService.create(2, { post_id: 1, content: 'test' })
  assert.equal(comment.content, 'test')
  assert.equal(f.comments.length, 1)
})

test('disabling after use blocks new mutations without deleting history', async () => {
  const f = fixture(1)
  await f.likes.like(1, 2)
  await f.commentService.create(2, { post_id: 1, content: 'existing' })
  f.record.publishEnabled = 0
  await assert.rejects(() => f.likes.unlike(1, 2), (error) => error.getStatus() === 403)
  await assert.rejects(() => f.commentService.create(2, { post_id: 1, content: 'blocked' }), (error) => error.getStatus() === 403)
  assert.equal(f.comments.length, 1)
  assert.equal((await f.likes.status(1, 2)).liked, true)
  f.record.publishEnabled = 1
  assert.equal((await f.likes.unlike(1, 2)).liked, false)
})
