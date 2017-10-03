import React from 'react'
import PropTypes from 'prop-types'
import dateformat from 'dateformat'
import marked from 'marked'
import styles from './recording.module.scss'


export default class Recording extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentTime: 0,
      isPlaying: false,
      progress: 0
    }
    this.mediaState = this.mediaState.bind(this)
    this.onEnded = this.onEnded.bind(this)
    this.onTimeUpdate = this.onTimeUpdate.bind(this)
    this.onLoadedData = this.onLoadedData.bind(this)
    this.onLoadStart = this.onLoadStart.bind(this)
    this.toggleMedia = this.toggleMedia.bind(this)
  }

  componentDidMount() {
    this.media.style.display = 'none'
  }

  getSavedState() {
    return JSON.parse(window.localStorage.getItem(`recording-${this.props.id}`))
  }

  mediaState() {
    return this.media.paused
  }

  onEnded() {
    this.setState({
      currentTime: 0,
      mediaState: 'paused',
      progress: 0
    })
    this.setSavedState()
  }

  onLoadedData() {
    this.media.currentTime = this.state.currentTime
  }

  onLoadStart() {
    const savedState = this.getSavedState()

    if (savedState) {
      this.setState(savedState)
    }
  }

  onTimeUpdate() {
    this.setState({
      currentTime: this.media.currentTime,
      progress: `${Math.ceil((this.media.currentTime / this.media.duration) * 100)}%`
    })
    this.setSavedState()
  }

  setSavedState() {
    window.localStorage.setItem(`recording-${this.props.id}`, JSON.stringify(this.state))
  }

  toggleMedia() {
    if (this.media.paused) {
      this.media.play()
      this.setState({ mediaState: 'playing' })
    } else {
      this.media.pause()
      this.setState({ mediaState: 'paused' })
    }

    if (this.props.onMediaToggle) {
      this.props.onMediaToggle(this.media)
    }
  }

  render() {
    const date = dateformat(this.props.date, 'mmmm d, yyyy')
    const mediaButtonText = this.props.media ? 'Play Sample' : ''

    return (
      <li className={styles.item} key={this.props.id}>
        <div className={styles.imageLayout}>
          <div className={styles.imageWrapper}>
            <div className={styles.image} style={{ backgroundImage: `url(${this.props.imageSrc})` }}></div>
          </div>
        </div>

        <article className={styles.contentWrapper}>
          <div className={styles.content}>
            <h1 className={styles.title}>{this.props.title}</h1>

            {this.props.media ?
            <div className={styles.mediaPlayer}>
              <button
                className={styles.mediaButton}
                data-state={this.state.mediaState}
                onClick={this.toggleMedia}
                onTouchStart={() => {}}
              >
                <div className={styles.mediaButtonsIcons}>
                  <svg className={styles.icon} data-icon="play" viewBox="0 0 12 14">
                    <polygon points="0 0 0 14 12 7"></polygon>
                  </svg>
                  <svg className={styles.icon} data-icon="pause" viewBox="0 0 14 14">
                    <path d="M0,0 L0,14 L5,14 L5,0 L0,0 Z M9,0 L9,14 L14,14 L14,0 L9,0 Z"></path>
                  </svg>
                </div>
              </button>

              <div className={styles.progressTrack}>
                <span
                  className={styles.progress}
                  ref={progress => this.progress = progress}
                  style={{ width: this.state.progress || '100%' }}
                >
                </span>
              </div>
            </div>
              : ''
            }

            <audio
              className={styles.media}
              controls
              onEnded={this.onEnded}
              onLoadStart={this.onLoadStart}
              onLoadedData={this.onLoadedData}
              onTimeUpdate={this.onTimeUpdate}
              preload="none"
              ref={media => this.media = media}
              src={this.props.media}
            ></audio>

            <div
              className={styles.paragraphWrapper}
              dangerouslySetInnerHTML={{ __html: marked(this.props.description) }} />

            <time className={styles.date}>{date}</time>
          </div>
        </article>
      </li>
    )
  }
}

Recording.propTypes = {
  description: PropTypes.string,
  imageSrc: PropTypes.string,
  imageSrcSet: PropTypes.string,
  media: PropTypes.string,
  onMediaToggle: PropTypes.func,
  recordingUrl: PropTypes.string,
  title: PropTypes.string,
}
