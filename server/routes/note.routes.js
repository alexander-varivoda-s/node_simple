const Router = require('koa-router');

const { passportAuthHandler } = require('../utils/auth');
const NotesController = require('../controllers/note.controller');
const Note = require('../models/note');
const Tag = require('../models/tag');

const router = new Router();
router.use(passportAuthHandler('jwt'));
router.prefix('/api/notes');

const loadParam = (model, name) => async (id, ctx, next) => {
  const { user } = ctx.state;

  ctx.state[name] = await model
    .findOne({
      _id: id,
      author: user.id,
    })
    .exec();

  if (!ctx.state[name]) {
    ctx.throw(404, `${name} does not exists or not owned by current user.`);
  } else {
    await next();
  }
};

router.param('note', loadParam(Note, 'note'));
router.param('tag', loadParam(Tag, 'tag'));

router.get('/', NotesController.getNotes());
router.post('/', NotesController.createNote());
router.patch('/:note', NotesController.updateNote());
router.delete('/', NotesController.clearAll());
router.delete('/:note', NotesController.deleteNote());
router.patch('/:note/tag/:tag', NotesController.tagNote());
router.patch('/:note/untag/:tag', NotesController.untagNote());
router.patch('/:note/pin', NotesController.pinNote());
router.patch('/:note/unpin', NotesController.unpinNote());

module.exports = router.routes();
