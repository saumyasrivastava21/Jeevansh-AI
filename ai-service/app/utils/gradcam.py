import torch
import numpy as np
import cv2
import base64
from PIL import Image

class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.activations = None
        self.gradients = None
        
        # Register PyTorch hooks
        self.forward_hook = target_layer.register_forward_hook(self.save_activation)
        self.backward_hook = target_layer.register_full_backward_hook(self.save_gradient)

    def save_activation(self, module, input, output):
        self.activations = output.detach()

    def save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0].detach()

    def generate(self, input_tensor: torch.Tensor, class_idx: int = None) -> np.ndarray:
        """
        Runs the backward pass to calculate gradients and weights, computing the Grad-CAM activation map.
        """
        self.model.eval()
        
        # Ensure gradients are enabled for backward pass
        with torch.enable_grad():
            # Clone input and set requires_grad to True
            input_tensor = input_tensor.clone().detach().requires_grad_(True)
            
            # Forward pass
            output = self.model(input_tensor)
            
            if class_idx is None:
                class_idx = output.argmax(dim=1).item()
                
            # Zero out existing gradients
            self.model.zero_grad()
            
            # Backward pass on the target class score
            score = output[0, class_idx]
            score.backward()
            
            if self.gradients is None or self.activations is None:
                # Return uniform map if gradients hook didn't fire (e.g. mock model error fallback)
                return np.zeros((input_tensor.shape[2], input_tensor.shape[3]), dtype=np.float32)
            
            gradients = self.gradients[0]      # shape: [C, H, W]
            activations = self.activations[0]  # shape: [C, H, W]
            
            # Compute channel weights (global average pooling of gradients)
            weights = torch.mean(gradients, dim=(1, 2), keepdim=True)
            
            # Linear combination of activations
            cam = torch.sum(weights * activations, dim=0)
            
            # Apply ReLU to keep positive influence features
            cam = torch.clamp(cam, min=0)
            
            # Normalize CAM map
            cam_min, cam_max = cam.min(), cam.max()
            if cam_max > cam_min:
                cam = (cam - cam_min) / (cam_max - cam_min)
            else:
                cam = torch.zeros_like(cam)
                
            return cam.cpu().numpy()

    def remove_hooks(self):
        """Clean hooks up to prevent memory leaks."""
        self.forward_hook.remove()
        self.backward_hook.remove()

def overlay_heatmap_on_image(original_image: Image.Image, heatmap_np: np.ndarray, alpha: float = 0.5) -> str:
    """
    Overlays a 2D Grad-CAM heatmap array on the original image, converting the merged image into a base64 string.
    """
    # Convert PIL Image to OpenCV BGR
    img = np.array(original_image.convert("RGB"))
    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
    h, w, _ = img.shape
    
    # Resize heatmap to match image size
    heatmap_resized = cv2.resize(heatmap_np, (w, h))
    
    # Apply JET colormap to 0-255 mapping of heatmap
    heatmap_colored = cv2.applyColorMap(np.uint8(255 * heatmap_resized), cv2.COLORMAP_JET)
    
    # Blend input scan with heatmap overlay
    blended = cv2.addWeighted(img, 1.0 - alpha, heatmap_colored, alpha, 0)
    
    # Encode as JPG
    _, buffer = cv2.imencode(".jpg", blended)
    base64_str = base64.b64encode(buffer).decode("utf-8")
    return base64_str
