<template>
    <div id="app">
        <card-container ref="conCard" @setting="openSetting"></card-container>
        <setting-container 
            ref="conSetting" 
            v-show="settingOpened"
            @close="saveSetting">
        </setting-container>
    </div>
</template>

<script>
import CardContainer from './components/CardContainer.vue'
import SettingContainer from './components/SettingContainer.vue'

export default {
    name: 'app',
    components: {
        CardContainer,
        SettingContainer
    },
    data () {
        return {
            settingOpened: false
        }
    },
    mounted () {
        this.$api('settings', (d) => {
            this.$refs.conCard.updateSettings(d);
            this.$refs.conSetting.updateSettings(d);
        });
    },
    methods: {
        openSetting () {
            this.settingOpened = true;
        },
        saveSetting (settings) {
            this.settingOpened = false;
            Object.keys(settings.hotkeys).forEach((x) => {
                this.$api('setkey', {
                    key: x,
                    val: settings.hotkeys[x].join(',')
                });
            });
            Object.keys(settings.times).forEach((x) => {
                this.$api('setcfg', {
                    key: x,
                    type: 'int',
                    val: settings.times[x]
                });
            });
            this.$refs.conCard.updateSettings(settings);
        }
    }
}
</script>

<style>
    body{
        margin: 0;
        background-color: #333739;
    }
    #app{
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }
</style>
