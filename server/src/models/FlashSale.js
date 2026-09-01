import mongoose from 'mongoose';
const schema=new mongoose.Schema({exam:{type:mongoose.Schema.Types.ObjectId,ref:'Exam',required:true},salePrice:{type:Number,required:true,min:0},originalPrice:{type:Number,required:true,min:0},startsAt:{type:Date,required:true},endsAt:{type:Date,required:true,index:true},banner:{url:String,publicId:String},active:{type:Boolean,default:true}},{timestamps:true});
schema.pre('validate',function(next){if(this.endsAt<=this.startsAt)return next(new Error('End date must be after start date'));if(this.salePrice>this.originalPrice)return next(new Error('Sale price cannot exceed original price'));next()});
export default mongoose.model('FlashSale',schema);
