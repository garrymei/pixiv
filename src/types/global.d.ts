/// <reference types="@tarojs/taro" />

declare module '*.png';
declare module '*.gif';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.styl';

declare namespace NodeJS {
  interface ProcessEnv {
    TARO_ENV: 'weapp' | 'swan' | 'alipay' | 'h5' | 'rn' | 'tt' | 'quickapp' | 'qq' | 'jd'
    API_MODE?: 'mock' | 'real'
    APP_ENV?: 'local' | 'test'
    LOCAL_API_BASE_URL?: string
    TEST_API_BASE_URL?: string
    LOCAL_UPLOAD_BASE_URL?: string
    TEST_UPLOAD_BASE_URL?: string
  }
}
