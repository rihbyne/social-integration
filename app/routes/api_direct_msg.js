var express = require('express')
var router = express.Router()

var ctrlDirectMsg = require('../controllers/directMsg')

router.get('/:user_id/msgsession', ctrlDirectMsg.getDMs)
router.get('/:user_id/msgsession/unreadcount', ctrlDirectMsg.getDMUnreadCount)
router.get('/:user_id/msgsession/:id', ctrlDirectMsg.getDMById)
router.post('/:user_id/msgsession', ctrlDirectMsg.startDM)
router.delete('/:user_id/msgsession/:id', ctrlDirectMsg.removeSessionById)
router.post('/:user_id/msgsession/:id/flag', ctrlDirectMsg.flagSessionById)
router.put('/:user_id/msgsession/:id', ctrlDirectMsg.resumeDMById)
router.delete('/:user_id/msgsession/:id/msg/:msg_id', ctrlDirectMsg.removeDMByMsgId)
router.get('/flagoptions', ctrlDirectMsg.getFlagOptions)
router.post('/:user_id/msgsession/:id/msg/:msg_id/flag', ctrlDirectMsg.flagMsgId)

module.exports = router;
