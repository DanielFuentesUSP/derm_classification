
from config import *
from dataset_creator import *
from train import *
from metrics import metrics

if __name__ == "__main__":
    print("Iniciando Job!!")
    dict_generator = load_data()
    model = train_resnet(dict_generator)
    metrics(model, dict_generator)