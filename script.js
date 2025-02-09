const fileInput = document.querySelector(".file-input"),
filterOptions = document.querySelectorAll(".filter button"),
filterName = document.querySelector(".filter-info .name"),
filterValue = document.querySelector(".filter-info .value"),
filterSlider = document.querySelector(".slider input"),
rotateOptions = document.querySelectorAll(".rotate button"),
previewImg = document.querySelector(".preview-img img"),
resetFilterBtn = document.querySelector(".reset-filter"),
chooseImgBtn = document.querySelector(".choose-img"),
saveImgBtn = document.querySelector(".save-img");
let brightness = "100", saturation = "100", inversion = "0", grayscale = "0";
let rotate = 0, flipHorizontal = 1, flipVertical = 1;
let originalImgSrc;

previewImg.addEventListener('click',()=>fileInput.click());
const loadImage = () => {
    let file = fileInput.files[0];
    if(!file) return;
    previewImg.src = URL.createObjectURL(file); // Store the original image source
    // originalImgSrc = URL.createObjectURL(file);
    originalImgSrc=previewImg.src;
    console.log(originalImgSrc);
    
    previewImg.addEventListener("load", () => {
        resetFilterBtn.click();
        document.querySelector(".container").classList.remove("disable");
    });
}
let modifiedCanvas = document.createElement('canvas');
let modifiedCtx = modifiedCanvas.getContext('2d');
let modifiedImageData = ""; // To store the modified image
const applyFilter = () => {
     // Set canvas size to match the original image
     modifiedCanvas.width = previewImg.naturalWidth;
     modifiedCanvas.height = previewImg.naturalHeight;
 
     // Apply filters and transformations
     modifiedCtx.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
     modifiedCtx.translate(modifiedCanvas.width / 2, modifiedCanvas.height / 2);
     if (rotate !== 0) {
         modifiedCtx.rotate(rotate * Math.PI / 180);
     }
     modifiedCtx.scale(flipHorizontal, flipVertical);
     modifiedCtx.drawImage(previewImg, -modifiedCanvas.width / 2, -modifiedCanvas.height / 2);
 
     // Save the modified image as a DataURL
     modifiedImageData = modifiedCanvas.toDataURL();
    previewImg.style.transform = `rotate(${rotate}deg) scale(${flipHorizontal}, ${flipVertical})`;
    previewImg.style.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
}

filterOptions.forEach(option => {
    option.addEventListener("click", () => {
        document.querySelector(".active").classList.remove("active");
        option.classList.add("active");
        filterName.innerText = option.innerText;

        if(option.id === "brightness") {
            filterSlider.max = "200";
            filterSlider.value = brightness;
            filterValue.innerText = `${brightness}%`;
        } else if(option.id === "saturation") {
            filterSlider.max = "200";
            filterSlider.value = saturation;
            filterValue.innerText = `${saturation}%`
        } else if(option.id === "inversion") {
            filterSlider.max = "100";
            filterSlider.value = inversion;
            filterValue.innerText = `${inversion}%`;
        } else {
            filterSlider.max = "100";
            filterSlider.value = grayscale;
            filterValue.innerText = `${grayscale}%`;
        }
    });
});

const updateFilter = () => {
    filterValue.innerText = `${filterSlider.value}%`;
    const selectedFilter = document.querySelector(".filter .active");

    if(selectedFilter.id === "brightness") {
        brightness = filterSlider.value;
    } else if(selectedFilter.id === "saturation") {
        saturation = filterSlider.value;
    } else if(selectedFilter.id === "inversion") {
        inversion = filterSlider.value;
    } else {
        grayscale = filterSlider.value;
    }
    applyFilter();
}

rotateOptions.forEach(option => {
    option.addEventListener("click", () => {
        if(option.id === "left") {
            rotate -= 90;
        } else if(option.id === "right") {
            rotate += 90;
        } else if(option.id === "horizontal") {
            flipHorizontal = flipHorizontal === 1 ? -1 : 1;
        } else {
            flipVertical = flipVertical === 1 ? -1 : 1;
        }
        applyFilter();
    });
});


const saveImage = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = previewImg.naturalWidth;
    canvas.height = previewImg.naturalHeight;
    
    ctx.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    if(rotate !== 0) {
        ctx.rotate(rotate * Math.PI / 180);
    }
    ctx.scale(flipHorizontal, flipVertical);
    ctx.drawImage(previewImg, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    
    const link = document.createElement("a");
    link.download = "image.jpg";
    link.href = canvas.toDataURL();
    link.click();
}

//for crop
const startCropBtn = document.getElementById('start-crop');
const applyCropBtn = document.getElementById('apply-crop');

let cropping = false;
let cropBox = null;
// let applyCrop=0;
let isResizing = false;
let currentHandle = null;

startCropBtn.addEventListener('click', () => {
    if (!cropping) {
      cropping = true;
  
      // Create a crop box dynamically
      cropBox = document.createElement('div');
      cropBox.className = 'crop-box';

       // Add resize handles to the crop box
       ['top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach(handle => {
        const resizeHandle = document.createElement('div');
        resizeHandle.className = `resize-handle ${handle}`;
        cropBox.appendChild(resizeHandle);
    });
  
      // Append to the preview image's container
      const previewContainer = previewImg.parentElement;
      previewContainer.style.position = 'relative';
      previewContainer.appendChild(cropBox);
  
      // Get dimensions of the container and set initial crop box dimensions
      const containerRect = previewContainer.getBoundingClientRect();
      const cropWidth = 100; // Initial crop box width
      const cropHeight = 100; // Initial crop box height
  
      cropBox.style.width = `${cropWidth}px`;
      cropBox.style.height = `${cropHeight}px`;
  
      // Center the crop box
      cropBox.style.position = 'absolute';
      cropBox.style.top = `${(containerRect.height - cropHeight) / 2}px`;
      cropBox.style.left = `${(containerRect.width - cropWidth) / 2}px`;
    } else {
      cropBox.remove();
      cropping = false;
    }
  });

document.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('resize-handle')) {
        isResizing = true;
        currentHandle = e.target;
        document.body.style.cursor = getComputedStyle(currentHandle).cursor; // Change cursor for better UX
    }
});

document.addEventListener('mousemove', (e) => {
    if (isResizing && cropBox) {
        const rect = cropBox.getBoundingClientRect();
        const parentRect = cropBox.parentElement.getBoundingClientRect();

        let newWidth = rect.width;
        let newHeight = rect.height;
        let newTop = rect.top - parentRect.top;
        let newLeft = rect.left - parentRect.left;

        if (currentHandle.classList.contains('top-left')) {
            newWidth = rect.right - e.clientX;
            newHeight = rect.bottom - e.clientY;
            newTop = e.clientY - parentRect.top;
            newLeft = e.clientX - parentRect.left;
        } else if (currentHandle.classList.contains('top-right')) {
            newWidth = e.clientX - rect.left;
            newHeight = rect.bottom - e.clientY;
            newTop = e.clientY - parentRect.top;
        } else if (currentHandle.classList.contains('bottom-left')) {
            newWidth = rect.right - e.clientX;
            newHeight = e.clientY - rect.top;
            newLeft = e.clientX - parentRect.left;
        } else if (currentHandle.classList.contains('bottom-right')) {
            newWidth = e.clientX - rect.left;
            newHeight = e.clientY - rect.top;
        }

        // Ensure minimum size and boundaries
        cropBox.style.width = `${Math.max(newWidth, 20)}px`; // Minimum size: 20px
        cropBox.style.height = `${Math.max(newHeight, 20)}px`;
        cropBox.style.top = `${Math.max(newTop, 0)}px`;
        cropBox.style.left = `${Math.max(newLeft, 0)}px`;
    }
});

document.addEventListener('mouseup', () => {
    if (isResizing) {
        isResizing = false;
        currentHandle = null;
        document.body.style.cursor = 'default'; // Reset cursor
    }
});

  applyCropBtn.addEventListener('click', () => {
    if (cropping && cropBox) {
        const cropRect = cropBox.getBoundingClientRect();
        const imgRect = previewImg.getBoundingClientRect();

        // Calculate crop dimensions relative to the actual image
        const scaleX = modifiedCanvas.width / imgRect.width;
        const scaleY = modifiedCanvas.height / imgRect.height;

        const startX = (cropRect.left - imgRect.left) * scaleX;
        const startY = (cropRect.top - imgRect.top) * scaleY;
        const width = cropRect.width * scaleX;
        const height = cropRect.height * scaleY;

        // Create a canvas for cropping
        const cropCanvas = document.createElement('canvas');
        const cropCtx = cropCanvas.getContext('2d');
        cropCanvas.width = width;
        cropCanvas.height = height;

        // Draw the cropped section from the modified image
        const modifiedImage = new Image();
        modifiedImage.src = modifiedImageData; // Use the modified image

        modifiedImage.onload = () => {
            cropCtx.drawImage(
                modifiedImage,
                startX, startY, width, height, // Source rectangle
                0, 0, width, height // Destination rectangle
            );

            // Update the preview image with the cropped canvas
            previewImg.src = cropCanvas.toDataURL();

            // Remove the crop box and reset cropping state
            cropBox.remove();
            cropping = false;
        };
        // Handle image loading errors
        modifiedImage.onerror = () => {
            console.error("Failed to load the modified image for cropping.");
        };
    }
    else{

    }
});


  
   


//for reset from crop
function toggleButtonActive(button, isActive) {
    if (isActive) {
      button.style.backgroundColor = '#8c52ff';
      button.style.color = '#fff';
      button.classList.add('active');
    } else {
      button.style.backgroundColor = '';
      button.style.color = '';
    }
  }

const resetFilter = () => {
    brightness = "100"; saturation = "100"; inversion = "0"; grayscale = "0";
    rotate = 0; flipHorizontal = 1; flipVertical = 1;
    if (cropBox) cropBox.remove();
    cropping = false;
        // Restore the original image
        // if (originalImgSrc) {
        //     previewImg.src = originalImgSrc;
        // }
    toggleButtonActive(startCropBtn, false);
    toggleButtonActive(applyCropBtn, false);
    applyFilter();
}

filterSlider.addEventListener("input", updateFilter);
resetFilterBtn.addEventListener("click", resetFilter);
saveImgBtn.addEventListener("click", saveImage);
fileInput.addEventListener("change", loadImage);
chooseImgBtn.addEventListener("click", () => fileInput.click());