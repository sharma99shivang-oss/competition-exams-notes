import {configureStore} from '@reduxjs/toolkit';import auth from './authSlice';import {attachStore} from './api';const store=configureStore({reducer:{auth}});attachStore(store);export default store;
