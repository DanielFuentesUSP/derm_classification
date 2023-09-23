import os

imgs_dir="/media/luma/hd1t/Documentos/Mestrado/experimentos/dados/dermnet_teste/imgs"
out_dir="/media/luma/hd1t/Documentos/Mestrado/experimentos/dados/dermnet_teste/results/experiment1"

N_CLASSES=3
EPOCHS=2
LEARNING_RATE=0.001

BATCH_SIZE = 16
IMG_WIDTH, IMG_HEIGHT = 224, 224
input_shape = (IMG_WIDTH, IMG_HEIGHT, 3)

filenames_dir= os.path.join(out_dir, 'filenames')
model_dir= os.path.join(out_dir, 'model')
results_dir= os.path.join(out_dir, 'result')

os.makedirs(model_dir, exist_ok=True)
os.makedirs(filenames_dir, exist_ok=True)
os.makedirs(results_dir, exist_ok=True)
