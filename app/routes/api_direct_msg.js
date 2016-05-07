var express = require('express')
var router = express.Router()

var ctrlDirectMsg = require('../controllers/directMsg')

router.get('/:user_id/msgtexts', ctrlDirectMsg.getDMs)
router.get('/:user_id/msgtexts/unreadcount', ctrlDirectMsg.getDMUnreadCount)
router.get('/:user_id/msgtexts/:id', ctrlDirectMsg.getDMById)
router.post('/:user_id/msgtexts', ctrlDirectMsg.startDM)
router.delete('/:user_id/msgtexts/:id', ctrlDirectMsg.removeSessionById)
router.post('/:user_id/msgtexts/:id/flag', ctrlDirectMsg.flagSessionById)
router.put('/:user_id/msgtexts/:id', ctrlDirectMsg.resumeDMById)
router.delete('/:user_id/msgtexts/:id/msg/:msg_id', ctrlDirectMsg.removeDMByMsgId)
router.get('/flagoptions', ctrlDirectMsg.getFlagOptions)
router.post('/:user_id/msgtexts/:id/msg/:msg_id/flag', ctrlDirectMsg.flagMsgId)

module.exports = router;
