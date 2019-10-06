class SvgAnimation extends HTMLElement {
    constructor() {
        super();
        this.prev = ''
    }

    connectedCallback() {
        this.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1000 300">
                <defs>
                    <clipPath id="clip-path">
                        <text x="500" y="200" text-anchor="middle" fill="#eee" font-family="inherit" id="text">
                            <tspan x="500" font-size="50" id="title1"></tspan>
                            <tspan x="500" dy="50" font-size="50" id="title2"></tspan>
                        </text>
                    </clipPath>
                </defs>
                <use xlink:href="#text" />
                <polygon fill="#ccc" id="path" clip-path="url(#clip-path)">
                    <animate begin="indefinite" attributeName="points" dur="30ms" to="" id="animate"  fill="freeze" />
                </polygon>
            </svg>
        `

        this.pathElement = this.querySelector('#path')
        this.animateElement = this.querySelector('#animate')
        this.titleElement = this.querySelector('#title1')
        this.subTitleElement = this.querySelector('#title2')

        this.title = 'TRACK'
        this.subTitle = 'not loaded'
    }

    animateWaveTo(dataArray, bufferLength) {
        const barWidth = (1000 / bufferLength) + 1
        let d = '0,500 '
    
        for (let i = 0; i < bufferLength; i++) {
            const barHeight = 500 - (dataArray[i] / 255 * 500).toFixed()
            const x = barWidth * i
            d += x + ',' + barHeight + ' '
        }
    
        d += '1000,500'
    
        if (this.prev && this.prev != d) {
            this.pathElement.setAttribute('points', this.prev)
            this.animateElement.setAttribute('to', d)
            this.animateElement.beginElement()
        }
    
        this.prev = d
    }

    setElementText(el, text) {
        el.innerHTML = text
        const bbox = el.getBBox()
        const oldFontSize = el.getAttribute('font-size')
        let newSize = (oldFontSize * 1000 / bbox.width).toFixed()
        newSize = Math.min(250, newSize)
        el.setAttribute('font-size', newSize)
    }

    set title(title) {
        this.setElementText(this.titleElement, title)
    }

    set subTitle(title) {
        this.setElementText(this.subTitleElement, title)
    }
}

customElements.define('svg-animation', SvgAnimation)