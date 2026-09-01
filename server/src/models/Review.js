import mongoose from 'mongoose';
const schema=new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},chapter:{type:mongoose.Schema.Types.ObjectId,ref:'Chapter'},rating:{type:Number,required:true,min:1,max:5},comment:{type:String,trim:true,maxlength:1000},approved:{type:Boolean,default:false},pinned:{type:Boolean,default:false}},{timestamps:true});
export default mongoose.model('Review',schema);
