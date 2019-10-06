class TrackSearch extends HTMLElement {
    constructor() {
        super();

        this.list = []
        this._clientId = this.getAttribute('clientId')

        this.attachShadow({mode: 'open'})

    }

    connectedCallback() {
        const style = document.createElement('style')
        style.textContent = `
            form {
                display: flex;
            }

            input {
                padding: 10px;
                box-sizing: border-box;
                flex: 1;
            }

            button,
            input {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
            }
        `
        this.shadowRoot.appendChild(style)

        this.input = this.makeInput()
        this.datalist = this.makeDataList()
        this.button = this.makeButton()

        const form = this.makeForm([
            this.input,
            this.datalist,
            this.button
        ])
        

        // load suggestions list on input
        this.input.addEventListener('input', this.onInput.bind(this))

        // make 'track-changed' event on select track
        this.input.addEventListener('change', this.onChange.bind(this))

        // clear input on focus
        this.input.addEventListener('focus', this.onFocus.bind(this))

        // make 'track-changed' event with default track data
        this.button.addEventListener('click', this.loadDefault.bind(this))

        this.shadowRoot.appendChild(form)
    }

    static get observedAttributes() {
        return ['clientId'];
    }

    makeInput() {
        const input = document.createElement('input')
        input.setAttribute('type', 'text')
        input.setAttribute('list', 'suggestions')
        return input
    }

    makeDataList() {
        const datalist = document.createElement('datalist')
        datalist.setAttribute('id', 'suggestions')
        return datalist
    }

    setSuggestions(list) {
        this.datalist.innerHTML = ''

        list.forEach(item => {
            const el = document.createElement('option')
            el.setAttribute('value', item.value)
            el.textContent = item.title
            this.datalist.appendChild(el)
        })

        this.list = list
    }

    makeButton() {
        const button = document.createElement('button')
        button.setAttribute('type', 'button')
        button.textContent = 'Load Default'
        return button
    }

    makeForm(controls) {
        const form = document.createElement('form')
        form.addEventListener('submit', () => false)
        controls.forEach(control => form.appendChild(control))
        return form
    }

    onInput(e) {
        const searchStr = encodeURI(e.target.value)
        const apiUrl = `https://api.soundcloud.com/tracks?q=${searchStr}&client_id=${this._clientId}`

        return fetch(apiUrl).then(response => {
            if(response.ok) {
                return response.json()
            }
            throw new Error(response.statusText)
        })
        .then(items => {
            const list = items.map(trackInfo => ({
                title: trackInfo.title,
                value: trackInfo.stream_url
            }))

            this.setSuggestions(list)
        })
        .catch(console.error)
    }

    onChange(e) {
        const value = e.target.value
        const selectedItem = this.list.find(item => item.value === value)

        if (selectedItem) {
            const [title = '', subTitle = ''] = selectedItem.title.split(' - ', 2)
            this.dispatchEvent(new CustomEvent('track-changed', {
                detail: {
                    title,
                    subTitle,
                    streamUrl: `${selectedItem.value}?client_id=${this._clientId}`
                }
            }))

        this.input.blur()
        }
    }

    onFocus(e) {
        e.target.value = ''
    }

    loadDefault() {
        this.input.value = 'This Is Our World - Royalty Free Music | Commercial Background Music | Upbeatsong.com'
        this.dispatchEvent(new CustomEvent('track-changed', {
            detail: {
                title: "This Is Our World",
                subTitle: "Royalty Free Music | Commercial Background Music | Upbeatsong.com",
                streamUrl: "https://api.soundcloud.com/tracks/332058112/stream?client_id=xCnnBZu68JABN6isZs5qWRLz9kHFCMpV"
            }
        }))
    }

    get clientId() {
        return this._clientId
    }

    set clientId(value) {
        this._clientId = value
    }
}

customElements.define('track-search', TrackSearch)