function ItemForm() {
  return (
    <form className="item-form">
      <h2><i className="fa-solid fa-list-check"></i> Add New Listing</h2>

      <label>
        Photo
        <input type="file" accept="image/*" />
      </label>

      <label>
        Title
        <input type="text" placeholder="Cordless drill" />
      </label>

      <label>
        Price
        <input type="number" placeholder="45" />
      </label>

      <label>
        Description
        <textarea placeholder="Good condition. Comes with battery and charger." />
      </label>

      <label className="checkbox-row">
        <input type="checkbox" />
        Publish immediately
      </label>

      <button type="submit">Save Listing</button>
    </form>
  )
}

export default ItemForm