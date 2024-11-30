import {
    LitElement,
    html,
    css,
} from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module"

class SearchableListCard extends LitElement {
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
        this.search_text = this.config.search_text || "Type to search / add"
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
                            alt="Clear"
                            title="Clear"
                        >
                        <ha-icon icon="mdi:plus"></ha-icon>
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
        if (item.status == 'completed') return html`<div id="results"><ha-checkbox @change=${this._changeItemStatus} id=${item.summary} checked></ha-checkbox><label for=${item.summary}><s>${item.summary}</s></label></div>`
        return html`<div id="results"><ha-checkbox @change=${this._changeItemStatus} id=${item.summary}></ha-checkbox><label for=${item.summary}>${item.summary}</label></div>`
    }

    async _getListItems() {
        let listResponse = await this.hass.callWS({
            type: 'todo/item/list',
            entity_id: this.config.entity
        })
        this.items = listResponse.items
        var items = this.searchText?.length == 0 ? this.items : this.results
        var items_done = items.filter((item) => item.status == 'completed')
        var items_todo = items.filter((item) => item.status == 'needs_action')

        var results = ['Active'].concat(items_todo.concat(['Completed'].concat(items_done)))

        this.results_rows = results.map((item) => this._createResultRow(item))
        return items
    }

    _valueChanged(ev) {
        var searchText = ev.target.value
        this._updateSearchResults(searchText)
    }

    _addKeyPress(ev) {
        if (ev.key === "Enter") {
            this._addItem()
        }
    }

    async _addItem() {
        this.items = []
        this.results = []
        this.results_rows = []
        await this.hass.callService("todo", "add_item", {
            entity_id: this.config.entity,
            item: this.searchText,
        })
        var a = this.searchText
        await this._getListItems()
        this._clearInput('')
        this._keepLastSearch(a);
        await this._getListItems();
    }
/*
    async _changeItemStatus(ev) {
        this.results = []
        this.results_rows = []
        this.update()
        await this.hass.callService("todo", "update_item", {
            entity_id: this.config.entity,
            item: ev.target.id,
            status: ev.currentTarget["__checked"] ? 'completed' : 'needs_action'
        })
        await this._getListItems()
        this._clearInput('')
    }
*/
    async _changeItemStatus(ev) {
        // Clear the current results
        this.results = [];
        this.results_rows = [];
        this.update();
    
        // Determine the new status
        const newStatus = ev.currentTarget["__checked"] ? 'completed' : 'needs_action';
    
        // Call the service to update the status of the item
        await this.hass.callService("todo", "update_item", {
            entity_id: this.config.entity,
            item: ev.target.id,
            status: newStatus
        });
    
        // Ensure last search is retained and re-fetch the list items
        var a = this.searchText
        await this._getListItems()
        this._clearInput('')
        this._keepLastSearch(a);
        await this._getListItems();
    }
    

    _keepLastSearch(en) {
        this.shadowRoot.getElementById('searchText').value = en
        this._updateSearchResults(en)
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
                vertical-align:middle;
                margin-left: 15px;
            }
            label {
                vertical-align:middle;
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
customElements.define("searchable-list-card", SearchableListCard)

window.customCards = window.customCards || []
window.customCards.push({
    type: "searchable-list-card",
    name: "Searchable List Card",
    preview: true,
    description: "A list card with search capabilities"
})