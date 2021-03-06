const Router = require('koa-router');

const { passportAuthHandler } = require('../utils/auth');
const Tag = require('../models/tag');
const TagsController = require('../controllers/tag.controller');

const router = new Router();
router.use(passportAuthHandler('jwt'));
router.prefix('/api/tags');

router.param('tag', async (id, ctx, next) => {
  ctx.state.tag = await Tag.findOne(
    {
      _id: id,
      author: ctx.state.user.id,
    },
    { __v: 0 }
  ).exec();

  if (!ctx.state.tag) {
    ctx.throw(404, 'Tag does not exists or not owned by current user.');
  } else {
    await next();
  }
});

router.get('/', TagsController.getTags());
router.post('/', TagsController.createTag());
router.delete('/:tag', TagsController.deleteTag());

module.exports = router.routes();
