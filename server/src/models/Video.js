import mongoose from 'mongoose';
const schema=new mongoose.Schema({chapter:{type:mongoose.Schema.Types.ObjectId,ref:'Chapter',required:true,unique:true},title:{type:String,required:true,trim:true},description:{type:String,default:''},duration:{type:Number,default:0,min:0},thumbnail:{url:String,publicId:String},video:{url:String,publicId:String,format:String},published:{type:Boolean,default:false}},{timestamps:true});
export default mongoose.model('Video',schema);
