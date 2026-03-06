var modelList;
async function loadFeatures() {

    const response = await fetch("LoadFeatures");
    if (response.ok) {

        const json = await response.json();
        const categoryList = json.categoryList;
        modelList = json.modelList;
        const colorList = json.colorList;
        const storageList = json.storageList;
        const conditionList = json.conditionList;
        loadSelectOptions("category-select", categoryList, ["id", "name"]);
        loadSelectOptions("model-select", modelList, ["id", "name"]);
        loadSelectOptions("color-select", colorList, ["id", "name"]);
        loadSelectOptions("storage-select", storageList, ["id", "value"]);
        loadSelectOptions("condition-select", conditionList, ["id", "name"]);
    } else {
        console.log("Error");
    }

}

function loadSelectOptions(selectTagId, list, propertyArray) {
    const selectTag = document.getElementById(selectTagId);
    list.forEach(item => {
        let optionTag = document.createElement("option");
        optionTag.value = item[propertyArray[0]];
        optionTag.innerHTML = item[propertyArray[1]];
        selectTag.appendChild(optionTag);
    });
}

function updateModels() {

    let modelSelectTag = document.getElementById("model-select");
    modelSelectTag.length = 1;
    let selectedCategoryId = document.getElementById("category-select").value;
    modelList.forEach(model => {
        if (model.category.id == selectedCategoryId) {
            let optionTag = document.createElement("option");
            optionTag.value = model.id;
            optionTag.innerHTML = model.name;
            modelSelectTag.appendChild(optionTag);
        }
    });
}

async function productListing() {

    const categorySelectTag = document.getElementById("category-select");
    const modelSelectTag = document.getElementById("model-select");
    const titleTag = document.getElementById("title");
    const descriptionTag = document.getElementById("description");
    const storageSelectTag = document.getElementById("storage-select");
    const colorSelectTag = document.getElementById("color-select");
    const conditionSelectTag = document.getElementById("condition-select");
    const priceTag = document.getElementById("price");
    const quantityTag = document.getElementById("quantity");
    const image1Tag = document.getElementById("image1");
    const image2Tag = document.getElementById("image2");
    const image3Tag = document.getElementById("image3");
    const showMessage = document.getElementById("message");

    const data = new FormData();
    data.append("categoryId", categorySelectTag.value);
    data.append("modelId", modelSelectTag.value);
    data.append("title", titleTag.value);
    data.append("description", descriptionTag.value);
    data.append("storageId", storageSelectTag.value);
    data.append("colorId", colorSelectTag.value);
    data.append("conditionId", conditionSelectTag.value);
    data.append("price", priceTag.value);
    data.append("quantity", quantityTag.value);
    data.append("image1", image1Tag.files[0]);
    data.append("image2", image2Tag.files[0]);
    data.append("image3", image3Tag.files[0]);

    const response = await fetch(
            "ProductListing",
            {
                method: "POST",
                body: data
            }
    );

    if (response.ok) {
        const json = await response.json();

        const popup = Notification();

        if (json.success) {
            categorySelectTag.value = 0;
            modelSelectTag.value = 0;
            titleTag.value = "";
            descriptionTag.value = "";
            storageSelectTag.value = 0;
            colorSelectTag.value = 0;
            conditionSelectTag.value = 0;
            priceTag.value = "";
            quantityTag.value = 1;
            image1Tag.value = null;
            image2Tag.value = null;
            image3Tag.value = null;

            popup.success({
                message: json.content
            });

        } else {

            popup.error({
                message: json.content
            });
        }

    } else {
        console.log("try agin");
    }

}