var express = require('express')
var router = express.Router()

var ctrlDirectMsg = require('../controllers/directMsg')

router.get('/:user_id/msgtexts', ctrlDirectMsg.getDMs)
router.get('/:user_id/msgtexts/:id', ctrlDirectMsg.getDMById)
router.post('/:user_id/msgtexts', ctrlDirectMsg.startDM)
router.put('/:user_id/msgtexts/:id', ctrlDirectMsg.resumeDMById)
router.delete('/:user_id/msgtexts/:id/msg/:msg_id', ctrlDirectMsg.removeDMByMsgId)
router.post('/:user_id/msgtexts/:id/msg/:msg_id', ctrlDirectMsg.flagMsgId)

module.exports = router;
