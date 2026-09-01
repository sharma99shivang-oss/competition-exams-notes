import mongoose from 'mongoose';
const asset={url:String,publicId:String,bytes:Number,format:String,originalName:String};
const schema=new mongoose.Schema({
 title:{type:String,required:true,trim:true},slug:{type:String,required:true,trim:true,lowercase:true,unique:true,index:true},description:{type:String,default:''},
 thumbnail:asset,banner:asset,price:{type:Number,default:0,min:0},discountPrice:{type:Number,min:0},language:{type:String,default:'English'},tags:[{type:String,trim:true}],
 isFeatured:{type:Boolean,default:false},status:{type:String,enum:['draft','published','archived'],default:'draft',index:true},
 seo:{metaTitle:{type:String,default:''},metaDescription:{type:String,default:''},keywords:[String]},createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'}
},{timestamps:true});
schema.pre('validate',function(next){if(!this.slug&&this.title)this.slug=this.title.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');if(this.discountPrice!=null&&this.discountPrice>this.price)return next(new Error('Discount price cannot exceed price'));next()});
export default mongoose.model('Exam',schema);
