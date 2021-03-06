<template>
  <div>
    <v-row>
      <v-col v-for="(video, i) in videoData" :key="i" cols="3">
        <v-card class="mx-auto">
          <v-img :src="video.video_thumbnails" />
          <v-card-title v-if="video.video_title.length > 20">
            <router-link to="">{{ video.video_title.slice(0, 20) + '...' }}</router-link></v-card-title
          >
          <v-card-title v-else
            ><router-link to="">{{ video.video_title }}</router-link></v-card-title
          >
          <div class="views" v-if="video.video_views < 1000">조회수 : {{ video.video_views }}회</div>
          <div class="views" v-else-if="video.video_views < 10000">
            조회수 : {{ parseInt(video.video_views / 1000) }}천회
          </div>
          <div v-else class="views">조회수 : {{ parseInt(video.video_views / 10000) }}만회</div>
          <v-card-text>
            <canvas :id="video._id" />
          </v-card-text>
          <v-spacer />
        </v-card>
      </v-col>
    </v-row>
    <infinite-loading @infinite="infiniteHandler" spinner="circles" />
  </div>
</template>

<script>
import InfiniteLoading from 'vue-infinite-loading'
import axios from 'axios'
import cookies from 'vue-cookies'
import Chart from 'chart.js'

const API_SERVER_URL = process.env.VUE_APP_API_SERVER_URL

const _ = require('lodash')

export default {
  name: 'Video',
  components: {
    InfiniteLoading
  },
  data() {
    return {
      config: {
        headers: {
          token: cookies.get('token'),
          limit: 0
        }
      },
      videoData: [],
      Id: '',
      chartData: {
        type: 'doughnut',
        data: {
          labels: [],
          datasets: [
            {
              data: [],
              backgroundColor: []
            }
          ]
        },
        options: {
          responsive: true,
          legend: {
            position: 'right',
            align: 'center',
            labels: {
              boxWidth: 3,
              padding: 25,
              rtl: true
            }
          },
          maintainAspectRatio: false,
          animation: false,
          pieceLabel: { mode: 'value', position: 'inside', fontSize: 11, fontStyle: 'bold' },
          tooltips: {
            callbacks: {
              label: function(tooltipItem, data) {
                return data.labels[tooltipItem.index] + ': ' + data.datasets[0].data[tooltipItem.index] + '%'
              }
            }
          }
        }
      }
    }
  },
  updated() {
    if (this.videoData.length) {
      for (let i = 0; i < this.videoData.length; i++) {
        this.createChart(this.videoData[i].chart, this.videoData[i].chartData)
      }
    }
  },
  methods: {
    infiniteHandler($state) {
      axios
        .get(`${API_SERVER_URL}/video/videos/${this.Id}`, this.config)
        .then(response => {
          setTimeout(() => {
            for (let k = 0; k < response.data.length; k++) {
              response.data[k].chartData = _.cloneDeep(this.chartData)
              response.data[k].chart = response.data[k]._id
            }
            if (response.data.length) {
              this.videoData = this.videoData.concat(response.data)
              $state.loaded()
              this.config.headers.limit += 4
              for (let i = 0; i < response.data.length; i++) {
                // this.videoData.chart = null
                if (response.data[i].video_record) {
                  for (let j = 0; j < response.data[i].video_record.length; j++) {
                    response.data[i].chartData.data.datasets[0].data.push(
                      Math.round(
                        (response.data[i].video_record[j].total_exposure_time / response.data[i].video_total) * 100
                      )
                    )
                    response.data[i].chartData.data.datasets[0].backgroundColor.push(this.dynamicColors())
                    response.data[i].chartData.data.labels.push(
                      response.data[i].video_record[j].company_id.company_nickname
                    )
                  }
                  // this.createChart(this.videoData[i]._id, this.videoData[i].chartData)
                }
              }
              if (this.videoData.length / 4 === 0) {
                $state.complete()
              }
            } else {
              $state.complete()
            }
          }, 1000)
        })
        .catch(error => {
          console.log(error)
        })
    },
    createChart(charId, chartData) {
      const ctx = document.getElementById(charId)
      const myChart = new Chart(ctx, {
        type: chartData.type,
        data: chartData.data,
        options: chartData.options
      })
      return myChart
    },
    dynamicColors() {
      const r = Math.floor(Math.random() * 255)
      const g = Math.floor(Math.random() * 255)
      const b = Math.floor(Math.random() * 255)
      return 'rgb(' + r + ',' + g + ',' + b + ')'
    }
  },
  update() {
    if (this.videoData.length) {
      for (let i = 0; i < this.videoData.length; i++) {
        this.createChart(this.videoData[i].chart, this.videoData[i].chartData)
      }
    }
  },
  created() {
    this.Id = cookies.get('channelId')
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/channel.scss';
</style>
