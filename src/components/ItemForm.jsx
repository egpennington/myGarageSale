import { useEffect, useState } from 'react'

function ItemForm({ handleAddItem, editingItem, setEditingItem,
  handleUpdateItem, }) {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('draft')
  
  const [imageFiles, setImageFiles] = useState([])
  const [category, setCategory] = useState('other')
  const [mainImageIndex, setMainImageIndex] = useState(0)
  const [existingImages, setExistingImages] = useState([])
  const [removedImages, setRemovedImages] = useState([])

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title)
      setPrice(editingItem.price)
      setDescription(editingItem.description)
      setStatus(editingItem.status)
      setCategory(editingItem.category || 'other')

      setExistingImages(editingItem.images || [])
      setImageFiles([])
      setMainImageIndex(0)
      setRemovedImages([])    
    }
  }, [editingItem])

  function handleImageChange(e) {
    const files = Array.from(e.target.files)

    if (!files.length) {
      return
    }

    const validFiles = files.filter((file) =>
      file.type.startsWith('image/')
    )

    if (validFiles.length !== files.length) {
      alert('Only image files are allowed.')
    }

    setImageFiles(validFiles)
    setMainImageIndex(0)
  }

  function handleSetExistingMain(index) {
    setExistingImages((currentImages) => {
      const selectedImage = currentImages[index]

      const otherImages = currentImages.filter(
        (_, imageIndex) => imageIndex !== index
      )

      return [
        selectedImage,
        ...otherImages,
      ]
    })
  }

  function handleRemoveExistingImage(index) {
    setExistingImages((currentImages) => {
      const imageToRemove = currentImages[index]

      setRemovedImages((currentRemoved) => [
        ...currentRemoved,
        imageToRemove,
      ])

      return currentImages.filter(
        (_, imageIndex) => imageIndex !== index
      )
    })
  }

  async function handleSubmit(e) {
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
        category,
        images: existingImages,
      }

      await handleUpdateItem(updatedItem, imageFiles, mainImageIndex, removedImages)
    } else {
      const newItem = {
        title,
        price: Number(price),
        description,
        status,
        category,
      }

      await handleAddItem(newItem, imageFiles, mainImageIndex)
    }

    setTitle('')
    setPrice('')
    setDescription('')
    setStatus('draft')
    setCategory('other')    
    setImageFiles([])
    setMainImageIndex(0)
    setExistingImages([])
    setRemovedImages([])
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
          multiple
          onChange={handleImageChange}
        />

        {editingItem && existingImages.length > 0 && (
          <div className="existing-images">
            <h3>Current Photos</h3>

            {existingImages.map((image, index) => (
              <div
                key={image.path || index}
                className="image-preview__item"
              >
                <img
                  src={image.url}
                  alt={`Current listing photo ${index + 1}`}
                />

                <button
                  type="button"
                  onClick={() => handleSetExistingMain(index)}
                >
                  {index === 0
                    ? 'Main Photo ✓'
                    : 'Set as Main'}
                </button>

                <button
                  type="button"
                  className="danger-button"
                  onClick={() => handleRemoveExistingImage(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {imageFiles.length > 0 && (
  <div className="image-preview">
    {imageFiles.map((file, index) => (
        <div
          key={`${file.name}-${index}`}
          className="image-preview__item"
        >
          <img
            src={URL.createObjectURL(file)}
            alt={`Listing preview ${index + 1}`}
          />

          <button
            type="button"
            onClick={() => setMainImageIndex(index)}
          >
            {mainImageIndex === index
              ? 'Main Photo ✓'
              : 'Set as Main'}
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => {
          setImageFiles([])
          setMainImageIndex(0)
        }}
      >
        Remove Photos
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
        Category
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}  
        >
          <option value ="art">Art</option>
          <option value="books">Books</option>
          <option value="electronics">Electronics</option>
          <option value="furniture">Furniture</option>
          <option value="tools">Tools</option>
          <option value="dvd">DVD</option>
          <option value="other">Other</option>          
        </select>
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
            setCategory('other')
            setImageFiles([])
            setMainImageIndex(0)
            setExistingImages([])
            setRemovedImages([])
          }}
        >
          Cancel Edit
        </button>
      )}
    </form>
  )
}

export default ItemForm