
import matplotlib.pyplot as plt
import os
from glob import glob
import cv2
import random
import pandas as pd
from sklearn.metrics import accuracy_score
from keras.preprocessing.image import ImageDataGenerator
from sklearn.model_selection import train_test_split

from config import *


train_datagen = ImageDataGenerator(
    rescale=1. / 255,
    # shear_range=0.2,
    zoom_range=0.2,
    rotation_range=40,
    horizontal_flip=True,
    validation_split=0.25
    )
test_datagen = ImageDataGenerator(rescale=1. / 255)


def sample_data(train_images):
    example_list = [image for image in random.sample(train_images, k=25)]
    example_list

    fig, axes = plt.subplots(2, 3, figsize=(10, 8))

    for i in range(25):
        plt.subplot(5,5,i+1)
        plt.xticks([])
        plt.yticks([])
        plt.grid(False)
        
        image = cv2.imread(example_list[i])
        plt.imshow(image)
    plt.show()


def split_train_test(df_data):
    if os.path.isfile(os.path.join(out_dir, 'train.csv')) and os.path.isfile(os.path.join(out_dir, 'test.csv')):
        print("Carregando data split CSVs")
        df_train=pd.read_csv(os.path.join(out_dir, 'train.csv'))
        df_test=pd.read_csv(os.path.join(out_dir, 'test.csv'))
        return df_train, df_test

    X_train, X_test, y_train, y_test = train_test_split(df_data['filename'], df_data['label'], shuffle=True, test_size=0.20, random_state=42)

    print("train: ", len(X_train))
    print("test: ", len(X_test))

    df_train = pd.DataFrame({'filename': X_train, 'label': y_train})
    df_train.to_csv(os.path.join(out_dir, 'train.csv'), index=False)

    df_test = pd.DataFrame({'filename': X_test, 'label': y_test})
    df_test.to_csv(os.path.join(out_dir, 'test.csv'), index=False)

    return df_train, df_test

def gera_labels(train_images):
    train_labels=[]
    for imagePath in train_images:
        label = os.path.basename(os.path.dirname(imagePath))
        train_labels.append(label)
    print(list(set(train_labels)))
    print(len(list(set(train_labels))))
    return train_labels

def carrega_geradores(df_train, df_test):
    train_generator = train_datagen.flow_from_dataframe(
        df_train,
        x_col="filename",
        y_col="label",
        subset="training",
        shuffle=True,
        class_mode="sparse",
        target_size=(IMG_WIDTH, IMG_HEIGHT),
        batch_size=BATCH_SIZE,
        )

    validation_generator = train_datagen.flow_from_dataframe(
        df_train,
        x_col="filename",
        y_col="label",
        subset="validation",
        shuffle=True,
        class_mode="sparse",
        target_size=(IMG_WIDTH, IMG_HEIGHT),
        batch_size=BATCH_SIZE,
        )


    test_generator=test_datagen.flow_from_dataframe(
        dataframe=df_test,
        x_col="filename",
        y_col="label",
        seed=42,
        shuffle=False,
        class_mode="sparse",
        # class_mode=None,
        target_size=(IMG_WIDTH, IMG_HEIGHT),
        batch_size=BATCH_SIZE,
        )

    dict_generator = {'test': test_generator,'val':validation_generator ,'train':train_generator}
    
    return dict_generator

def load_data():
    print("Iniciando Carrega dataset!!")
    total_images = sorted(glob(os.path.join(imgs_dir, "*.png")))
    print("Total de imgs ", len(total_images))
    print(total_images[:5])
    # gera labels  
    
    if not labels_csv: 
        total_labels=gera_labels(total_images)
        df_data = pd.DataFrame({'filename': total_images, 'label': total_labels})
    else:
        data_dict = {}
        labels_csv_df = pd.read_csv(labels_csv)
        
        labels_csv_df['filenames'] = labels_csv_df['img_id'].apply(lambda img_id: os.path.join(imgs_dir, img_id))
        data_dict = {'filename': labels_csv_df['filenames'], 'label': labels_csv_df['diagnostic']}
        df_data = pd.DataFrame(data_dict)
        
    # salva dataset como csv    
    df_data.to_csv(os.path.join(filenames_dir,'full_dataset.csv'), index=False)
    df_train, df_test = split_train_test(df_data)
    dict_generator = carrega_geradores(df_train, df_test)
    
    return dict_generator

if __name__ == "__main__":
    pass