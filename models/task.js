const mongoose = require('mongoose')

const TaskSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'Task name must be required'],
        trim:true,
        maxlength:[20]
    }, 
    completed:{
        type:Boolean,
        default:false
    }
})


module.exports = mongoose.model('Task', TaskSchema)