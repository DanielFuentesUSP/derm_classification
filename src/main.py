
from config import *
from dataset_creator import *
from train_resnet import *

if __name__ == "__main__":
    data = "Iniciando Job!!"
    dict_generator = load_data()
    train_resnet(dict_generator)