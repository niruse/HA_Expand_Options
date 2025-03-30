import {
    LitElement,
    html,
    css,
} from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module"

class SearchableListCardMainReadSearch extends LitElement {
    static get properties() {
        return {
            hass: {},
            config: {},
        }
    }

    setConfig(config) {
        this.items = []
        this.results = []
        this.results_rows = []
        this.searchText = ''
        this.config = config
        this.search_text = this.config.search_text || "Type to search"
    }

    getCardSize() {
        return 4
    }

    render() {
        if (!this.searchText) this._getListItems()

        return html`
            <ha-card>
                <div id="searchContainer">
                    <div id="searchTextFieldContainer">
                        <ha-textfield
                            id="searchText"
                            @input="${this._valueChanged}"
                            @keydown=${this._addKeyPress}
                            no-label-float type="text" autocomplete="off"
                            icon iconTrailing
                            label="${this.search_text}"
                        >
                        <ha-icon icon="mdi:magnify" id="searchIcon" slot="leadingIcon"></ha-icon>
                        <ha-icon-button
                            slot="trailingIcon"
                            @click="${this._addItem}"
                            alt="Add"
                            title="Add"
                        >
                        </ha-icon-button>
                        </ha-textfield>
                    </div>
                    ${(this.results?.length > 0 && this.results?.length < this.items.length) ?
                        html`<div id="count">Showing ${this.results.length - 2} of ${this.items.length} results</div>`
                        : ''}
                    </div>
                    ${(this.results_rows.length > 0) ?
                        this.results_rows
                        : ''}
            </ha-card>
        `
    }

    _createResultRow(item) {
        if (item == 'Active') return html`<div class="header"><span>Active</span></div>`
        if (item == 'Completed') return html`<div class="divider"></div><div class="header"><span>Completed</span></div>`
        if (item.status == 'completed') return html`<div id="results"><ha-checkbox @change=${this._changeItemStatus} id=${item.uid} checked></ha-checkbox><label for=${item.uid}><s>${item.summary}</s></label></div>`
        return html`<div id="results"><ha-checkbox @change=${this._changeItemStatus} id=${item.uid}></ha-checkbox><label for=${item.uid}>${item.summary}</label></div>`
    }

    async _getListItems() {
        try {
            let listResponse = await this.hass.callWS({
                type: 'todo/item/list',
                entity_id: this.config.entity,
            })

            // ✅ Ensure items are correctly assigned and reset results
            if (listResponse && Array.isArray(listResponse.items)) {
                this.items = listResponse.items
            } else {
                this.items = []
            }

            // ✅ Reset results and results_rows before updating
            this.results = []
            this.results_rows = []

            // ✅ Properly update search results or display all items
            var items = this.searchText?.length == 0 ? this.items : this.results
            var items_done = items.filter((item) => item.status == 'completed')
            var items_todo = items.filter((item) => item.status == 'needs_action')

            // ✅ Create result rows for Active/Completed sections
            var results = ['Active'].concat(items_todo.concat(['Completed'].concat(items_done)))
            this.results_rows = results.map((item) => this._createResultRow(item))

            // ✅ Update the card after fetching items
            this.requestUpdate()
        } catch (error) {
            console.error("❗ Error fetching items with todo/item/list:", error)
            this.items = []
            this.results_rows = []
            this.requestUpdate()
        }
    }

    _valueChanged(ev) {
        var searchText = ev.target.value
        this._updateSearchResults(searchText)
    }

    _addKeyPress(ev) {
        if (ev.key === "Enter") {
            //this._addItem()
        }
    }

    async _addItem() {
        if (!this.searchText.trim()) return
    
        await this.hass.callService("todo", "add_item", {
            entity_id: this.config.entity,
            item: this.searchText,
        })
    
        var a = this.searchText  // ✅ Store search text before clearing
        await this._getListItems()
        this._keepLastSearch(a) // ✅ Restore last search correctly
        this._clearInput()      // ✅ Clear input after restoring search
    }

    async _changeItemStatus(ev) {
        this.results = []
        this.results_rows = []
        this.update()
    
        const uid = ev.target.id
        const status = ev.currentTarget.checked ? 'completed' : 'needs_action'
    
        // ✅ Find the item based on UID
        const item = this.items.find((item) => item.uid === uid)
        if (!item) {
            console.error(`❗ Item with UID '${uid}' not found.`)
            return
        }
    
        // ✅ Call the service to update the item status
        await this.hass.callService("todo", "update_item", {
            entity_id: this.config.entity,
            item: item.summary, // Use item.summary, not UID
            status: status,
        })
    
        var a = this.searchText  // ✅ Store search text before clearing
        await this._getListItems()
        this._keepLastSearch(a) // ✅ Restore last search correctly
    }

    _clearInput() {
        this.shadowRoot.getElementById('searchText').value = ''
        this._updateSearchResults('')
    }
    
    _updateSearchResults(searchText) {
        this.results = []
        this.searchText = searchText
    
        if (!this.config || !this.hass || searchText === "") {
            this.results = this.items
            this._sortItems()
            this.update()
            return
        }
    
        try {
            var searchRegex = new RegExp(searchText, 'i')
            for (var item in this.items) {
                if (this.items[item]['summary'].search(searchRegex) >= 0) {
                    this.results.push(this.items[item])
                }
            }
        } catch (err) {
            console.warn(err)
        }

        this._sortItems()
        this.update()
    }

    _keepLastSearch(en) {
        if (en.trim() !== "") {
            this.shadowRoot.getElementById('searchText').value = en
            this._updateSearchResults(en)
        }
    }

    _sortItems() {
        var items_done = this.results.filter((item) => item.status == 'completed')
        var items_todo = this.results.filter((item) => item.status == 'needs_action')

        this.results = ['Active'].concat(items_todo.concat(['Completed'].concat(items_done)))

        this.results_rows = this.results.map((item) => this._createResultRow(item))
    }

    static get styles() {
        return css`
            #searchContainer {
                width: 90%;
                display: block;
                padding-top: 15px;
                padding-bottom: 15px;
                margin-left: auto;
                margin-right: auto;
            }
            #searchTextFieldContainer {
                display: flex;
                padding-top: 5px;
                padding-bottom: 5px;
            }
            #searchText {
                flex-grow: 1;
            }
            #count {
                text-align: right;
                font-style: italic;
            }
            #results {
                display: block;
                padding-bottom: 5px;
                margin-top: 5px;
                margin-left: auto;
                margin-right: auto;
                vertical-align: middle;
            }
            ha-checkbox {
                vertical-align: middle;
                margin-left: 15px;
            }
            label {
                vertical-align: middle;
            }
            .divider {
                height: 1px;
                background-color: var(--divider-color);
                margin: 10px 0;
            }
            .header {
                padding-left: 30px;
                padding-right: 16px;
                padding-inline-start: 30px;
                padding-inline-end: 16px;
                padding-top: 15px;
                padding-bottom: 15px;
                justify-content: space-between;
                direction: var(--direction);
            }
            .header span {
                color: var(--primary-text-color);
                font-weight: 500;
            }
            ha-icon {
                color: var(--primary-text-color);
            }
        `
    }
}

// ✅ Define the custom element with the new name
customElements.define("searchable-list-card-main-read-search", SearchableListCardMainReadSearch)

// ✅ Push updated card metadata to Home Assistant
window.customCards = window.customCards || []
window.customCards.push({
    type: "searchable-list-card-main-read-search",
    name: "Searchable List Card Main Read Search",
    preview: true,
    description: "A list card with search capabilities and persistent search functionality",
})
