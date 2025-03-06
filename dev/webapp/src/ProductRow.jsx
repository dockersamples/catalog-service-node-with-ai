import { useCallback, useState } from "react";
import productImage from "./product-image.png";

export function ProductRow({ product, onChange, onRecommend }) {
  const [inventoryDetails, setInventoryDetails] = useState(null);
  const [isRecommending, setIsRecommending] = useState(false);

  const fetchInventoryDetails = useCallback(() => {
    fetch(`/api/products/${product.id}`)
      .then((response) => response.json())
      .then(({ inventory }) => setInventoryDetails(inventory))
      .then(() => onChange());
  }, [setInventoryDetails, product.id, onChange]);

  const uploadImage = useCallback(() => {
    fetch(productImage)
      .then((r) => r.blob())
      .then((fileBlob) => {
        const file = new File([fileBlob], "product-image.png", {
          type: "image/png",
        });

        const formData = new FormData();
        formData.append("file", file);

        fetch(`/api/products/${product.id}/image`, {
          method: "POST",
          body: formData,
        }).then(() => onChange());
      });
  }, [product.id, onChange]);

  const getRecommendation = useCallback(() => {
    setIsRecommending(true);
    fetch(`/api/products/${product.id}/recommendations`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((recommendedProduct) => {
        onRecommend(recommendedProduct);
        setIsRecommending(false);
      })
      .catch((error) => {
        console.error("Error fetching recommendation:", error);
        setIsRecommending(false);
      });
  }, [product.id, onRecommend]);

  return (
    <tr>
      <td>{product.id}</td>
      <td>{product.name}</td>
      <td>{product.description}</td>
      <td>{product.price}</td>
      <td>{product.upc}</td>
      <td>
        {inventoryDetails ? (
          <>
            {inventoryDetails.error ? (
              <span className="error">{inventoryDetails.message}</span>
            ) : (
              <span>{inventoryDetails.quantity}</span>
            )}
          </>
        ) : (
          <button className="smaller" onClick={fetchInventoryDetails}>
            Fetch
          </button>
        )}
      </td>
      <td>
        {product.has_image ? (
          <img src={`/api/products/${product.id}/image`} alt={product.name} />
        ) : (
          <button className="smaller" onClick={uploadImage}>
            Upload
          </button>
        )}
      </td>
      <td>
        <button
          className="smaller"
          onClick={getRecommendation}
          disabled={isRecommending}
        >
          {isRecommending ? "Loading..." : "Recommend"}
        </button>
      </td>
    </tr>
  );
}
