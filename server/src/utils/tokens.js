import jwt from 'jsonwebtoken';
export const accessToken=(user)=>jwt.sign({id:user._id,role:user.role},process.env.JWT_ACCESS_SECRET||'development-access-secret-change-me',{expiresIn:'15m'});
export const refreshToken=(user)=>jwt.sign({id:user._id,role:user.role},process.env.JWT_REFRESH_SECRET||'development-refresh-secret-change-me',{expiresIn:'7d'});
export const cookieOptions={httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:process.env.NODE_ENV==='production'?'none':'lax',path:'/api/auth',maxAge:7*24*60*60*1000};
