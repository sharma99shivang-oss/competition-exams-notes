import mongoose from 'mongoose';
const schema=new mongoose.Schema({key:{type:String,required:true,unique:true,trim:true},value:{type:mongoose.Schema.Types.Mixed,required:true},isSecret:{type:Boolean,default:false}},{timestamps:true});
export default mongoose.model('Setting',schema);
