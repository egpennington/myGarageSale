import { useEffect, useState } from 'react'

function ItemForm({ setItems, editingItem, setEditingItem,
  handleUpdateItem, }) {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('draft')
  const [image, setImage] = useState('')

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title)
      setPrice(editingItem.price)
      setDescription(editingItem.description)
      setStatus(editingItem.status)
      setImage(editingItem.image || '')
    }
  }, [editingItem])

  function handleImageChange(e) {
    const file = e.target.files[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.')
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      setImage(reader.result)
    }

    reader.readAsDataURL(file)
  }

  function handleSubmit(e) {
    e.preventDefault()

    if (!title || !price || !description) {
      alert('Please fill out the title, price, and description.')
      return
    }

    if (editingItem) {
      const updatedItem = {
        ...editingItem,
        title,
        price: Number(price),
        description,
        status,
        image,
      }

      handleUpdateItem(updatedItem)
    } else {
      const newItem = {
        id: Date.now(),
        title,
        price: Number(price),
        description,
        status,
        image,
      }

      setItems((currentItems) => [...currentItems, newItem])
    }

    setTitle('')
    setPrice('')
    setDescription('')
    setStatus('draft')
    setImage('')
  }

  return (
    <form className="item-form" onSubmit={handleSubmit}>
      <h2><i className="fa-solid fa-list-check"></i>
        {editingItem ? ' Edit Listing' : ' Add New Listing'}
      </h2>

      <label>
        Photo
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        {image && (
          <div className="image-preview">
            <img src={image} alt="Listing preview" />

            <button
              type="button"
              onClick={() => setImage('')}
            >
              Remove Photo
            </button>
          </div>
        )}
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

      <button type="submit">
        {editingItem ? 'Save Changes' : 'Add Listing'}
      </button>

      {editingItem && (
        <button
          type="button"
          onClick={() => {
            setEditingItem(null)
            setTitle('')
            setPrice('')
            setDescription('')
            setStatus('draft')
          }}
        >
          Cancel Edit
        </button>
      )}
    </form>
  )
}

export default ItemForm