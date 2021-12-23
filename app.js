import createError from 'http-errors';
import express from 'express';
import logger from 'morgan';

import { router as indexRouter } from './routes/index.js';
import channelTrackingService from './tracking-service/tracking-service.js'
import channelChangeSendNotifService from './notification-service/send-channel-notification-async-service.js'
export const app = express();

// view engine setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: err
    });
});
app.listen(80, () => {
    console.log("ready")
    channelTrackingService.start()
    channelChangeSendNotifService.start()
})