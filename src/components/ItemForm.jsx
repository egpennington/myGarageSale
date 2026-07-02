import { useState } from "react"

function ItemForm() {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('draft')

  function handleSubmit(e) {
    e.preventDefault()

    const newItem = {
      id: Date.now(),
      title,
      price: Number(price),
      description,
      status,
      image: '',
    }

    console.log(newItem)
  }

  return (
    <form className="item-form" onSubmit={handleSubmit}>
      <h2><i className="fa-solid fa-list-check"></i> Add New Listing</h2>

      <label>
        Photo
        <input type="file" accept="image/*" />
      </label>

      <label>
        Title
        <input
          type="text"
          placeholder="Cordless drill"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      <label>
        Price
        <input
          type="number"
          placeholder="45"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </label>

      <label>
        Description
        <textarea
          placeholder="Good condition. Comes with battery and charger."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <label>
            Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="sold">Sold</option>
            </select>
      </label>

      <button type="submit">Save Listing</button>
    </form>
  )
}

export default ItemForm