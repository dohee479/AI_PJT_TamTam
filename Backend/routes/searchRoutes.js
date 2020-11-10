// library
const express = require('express')

// model
const VideoModel = require('../models/VideoModel')
const ChannelModel = require('../models/ChannelModel')

// Routes
const searchRoutes = express.Router()

// API

// 구독자 순서로 TOP 5
searchRoutes.get('/subscribe', async (req, res) => {
  if (req.headers.token) {
    try {
      const channelAll = await ChannelModel.find().sort({ channel_subscribe: -1 }).limit(5)
      res.status(200).send(channelAll)
    } catch (err) {
      res.status(500).send(err)
    }
  } else {
    res.status(403).send({ message: '로그인이 필요한 서비스입니다.' })
  }
})

// 구독자 대비 평균 조회수 TOP 5
searchRoutes.get('/avgviews', async (req, res) => {
  if (req.headers.token) {
    try {
      const channelAll = await ChannelModel.find()

      for (let i = 0; i < channelAll.length; i++) {
        const videos = await VideoModel.find({ channel_id: channelAll[i]._id })

        let totalview = 0
        for (let j = 0; j < videos.length; j++) {
          totalview += videos[j].video_views
        }
        let result = 0
        if (channelAll[i].channel_subscribe === 0) {
          result = 0
        } else {
          result = totalview / channelAll[i].channel_subscribe
          result = result.toFixed(3)
        }
        await ChannelModel.findOneAndUpdate({ _id: channelAll[i]._id }, { channel_avg_views: result })
      }
      const youtubers = await ChannelModel.find().sort({ channel_avg_views: -1 }).limit(5)
      res.status(200).send(youtubers)
    } catch (err) {
      res.status(500).send(err)
    }
  } else {
    res.status(403).send({ message: '로그인이 필요한 서비스입니다.' })
  }
})

// 추천영상

// 검색
searchRoutes.get('/:content', async (req, res) => {
  if (req.headers.token) {
    const content = req.params.content
    try {
      const videos = await VideoModel.find({ video_title: { $regex: content } })
      const channels = await ChannelModel.find({ channel_name: { $regex: content } })
      const searchData = { videos: videos, channels: channels }
      res.status(200).send(searchData)
    } catch (err) {
      res.status(500).send(err)
    }
  } else {
    res.status(403).send({ message: '로그인이 필요한 서비스입니다.' })
  }
})

module.exports = searchRoutes
