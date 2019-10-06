const audioCtx = new AudioContext()
const audioElement = document.querySelector('audio')
const trackSearchElement = document.querySelector('track-search')
const svgAnimationElement = document.querySelector('svg-animation')

audioElement.crossOrigin = 'anonymous'

// Handler for selected track
trackSearchElement.addEventListener('track-changed', (e) => {
    audioCtx.resume()

    // read info from search component and assign it to ausio and svg animator elements
    const { title, subTitle, streamUrl } = e.detail
    svgAnimationElement.title = title
    svgAnimationElement.subTitle = subTitle
    audioElement.src = streamUrl

    audioElement.play()
})

// Prepare analyzer
const analyser = audioCtx.createAnalyser()
const source = audioCtx.createMediaElementSource(audioElement)
source.connect(analyser)
analyser.connect(audioCtx.destination)
analyser.fftSize = 64
const bufferLength = analyser.frequencyBinCount
const dataArray = new Uint8Array(bufferLength)

// Animation loop. Reads data from analyzer and puts it onto svg animator
let requestID
const updateAnimation = () => {
    requestID = requestAnimationFrame(updateAnimation)
    analyser.getByteFrequencyData(dataArray)
    svgAnimationElement.animateWaveTo(dataArray, bufferLength)
}
updateAnimation()

