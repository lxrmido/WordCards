import installApi from './api';
import installCanvas from './canvas';

const injection = {};

export default Object.assign(injection, {

    install (Vue, options) {
        installApi(injection, Vue);
        installCanvas(injection, Vue);
        window.injection = injection;
    }

});
