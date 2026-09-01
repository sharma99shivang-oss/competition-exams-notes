import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
const userSchema = new mongoose.Schema({
  name:{type:String,required:true,trim:true}, email:{type:String,required:true,unique:true,lowercase:true,trim:true},
  password:{type:String,required:true,minlength:8,select:false}, role:{type:String,enum:['user','admin'],default:'user'},
  avatar:String, refreshTokens:[String], resetPasswordToken:String, resetPasswordExpires:Date, isActive:{type:Boolean,default:true}
},{timestamps:true});
userSchema.pre('save',async function(next){if(!this.isModified('password')) return next(); this.password=await bcrypt.hash(this.password,12);next();});
userSchema.methods.matchPassword=function(password){return bcrypt.compare(password,this.password)};
userSchema.methods.safe=function(){const {password,refreshTokens,...user}=this.toObject();return user};
export default mongoose.model('User',userSchema);
