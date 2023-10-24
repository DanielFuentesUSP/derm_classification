import os

imgs_dir="/home/luma/experiments/data/UNIFICADOS"
labels_csv=""
out_dir="/home/luma/experiments/data/results/unificados/vgg_200ep"

print("Salvando experimento em ", out_dir)

N_CLASSES=5
EPOCHS=200
EARLY_STOP=50
LEARNING_RATE=0.002

BATCH_SIZE = 50
IMG_WIDTH, IMG_HEIGHT = 512, 512

#REDE="DEFAULT"
# REDE="RESNET"
REDE="VGG"

input_shape = (IMG_WIDTH, IMG_HEIGHT, 3)

filenames_dir= os.path.join(out_dir, 'filenames')
model_dir= os.path.join(out_dir, 'model')
results_dir= os.path.join(out_dir, 'results')
sample_aug_dir = os.path.join(results_dir,'sample_aug.png')

os.makedirs(model_dir, exist_ok=True)
os.makedirs(filenames_dir, exist_ok=True)
os.makedirs(results_dir, exist_ok=True)
