
import matplotlib.pyplot as plt
import os
from tensorflow.keras.optimizers import Adam
from keras.models import Sequential
 
from tensorflow.keras.applications.resnet50 import ResNet50
import numpy as np
import pandas as pd
from keras.applications.vgg16 import VGG16, preprocess_input
from sklearn.metrics import accuracy_score
from sklearn.utils import class_weight
from tensorflow.keras.layers import (BatchNormalization, Activation, Conv2D, Dense,
                                     Dropout, Flatten, MaxPooling2D,
                                     RandomFlip, RandomRotation, RandomZoom,
                                     Rescaling, Resizing,concatenate)
from tensorflow.keras.layers import GaussianNoise
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import EarlyStopping
from keras.regularizers import l2
from config import *

def get_model():
    model = Sequential()
    
    if REDE=="RESNET":
        pretrained_model= ResNet50(include_top=False,
                                input_shape=input_shape,
                                pooling='avg',classes=N_CLASSES,
                                weights='imagenet')

        # congela as camadas
        for layer in pretrained_model.layers[:25]:
            layer.trainable=False

    elif REDE=="VGG":
        pretrained_model = VGG16(include_top=False,
                     weights='imagenet', 
                     input_shape=input_shape)
        # congela as camadas
        for layer in pretrained_model.layers[:25]:
            layer.trainable=False
    else:
        pretrained_model = Sequential()
        pretrained_model.add(Conv2D(32, (3, 3), input_shape=input_shape))
        pretrained_model.add(Activation('relu'))
        pretrained_model.add(MaxPooling2D(pool_size=(2, 2)))
        
        pretrained_model.add(Conv2D(32, (3, 3)))
        pretrained_model.add(Activation('relu'))
        pretrained_model.add(MaxPooling2D(pool_size=(2, 2)))
        
        pretrained_model.add(Conv2D(64, (3, 3)))
        pretrained_model.add(Activation('relu'))
        pretrained_model.add(MaxPooling2D(pool_size=(2, 2)))
                
    # ultimas camadas densas - as quais serão treinadas
    model = pretrained_model.output
    model = Flatten(name="flatten")(model)
    model = Dense(512, activation='relu', kernel_regularizer=l2(0.001))(model)
    #model = GaussianNoise(0.05)(model)
    model = Dropout(0.08, name="DROPOUT")(model)
    model = BatchNormalization(name="BatchNormalization")(model)
    model = Dense(256, activation='relu')(model)

    output_layer = Dense(N_CLASSES, activation='softmax')(model)

    model = Model(inputs=pretrained_model.input, outputs=output_layer, name="Model")

    print(model.summary())

    model.compile(optimizer=Adam(learning_rate=LEARNING_RATE),loss='sparse_categorical_crossentropy',metrics=['accuracy'])

    return model

def save_learn_curve(history):
    plt.figure(1, figsize = (15,8)) 
    
    plt.subplot(221)  
    plt.plot(history.history['accuracy'])  
    plt.plot(history.history['val_accuracy'])  
    plt.title('model accuracy')  
    plt.ylabel('accuracy')  
    plt.xlabel('epoch')  
    plt.legend(['train', 'valid']) 
        
    plt.subplot(222)  
    plt.plot(history.history['loss'])  
    plt.plot(history.history['val_loss'])  
    plt.title('model loss')  
    plt.ylabel('loss')  
    plt.xlabel('epoch')  
    plt.legend(['train', 'valid']) 

    #plt.show()
    plt.savefig(os.path.join( results_dir,'learning_curve.png'), bbox_inches='tight')


def train_resnet(dict_gen: dict):
    print("Iniciando Treino")

    if N_CLASSES != len(np.unique(dict_gen.get('train').classes)):
        print("Erro no numero de classes")

    model = get_model()
    class_weights = class_weight.compute_class_weight(class_weight='balanced',
                    classes=np.unique(dict_gen.get('train').classes), 
                    y=dict_gen.get('train').classes
                    )

    class_weights = dict(zip(np.unique(dict_gen.get('train').classes), class_weights))

    print('class_weights: ', class_weights)

    callback = EarlyStopping(monitor='loss', patience=EARLY_STOP)

    from datetime import datetime
    start_time = datetime.now()

    history = model.fit(
        dict_gen.get('train'),
        validation_data = dict_gen.get('val'),
        class_weight=class_weights,
        callbacks=[callback],
        epochs=EPOCHS,
    )
    model.save(model_dir)
    
    end_time = datetime.now()
    print('Duration: {}'.format(end_time - start_time))
    save_learn_curve(history)
    #save_predictions(model, dict_gen)
    
    return model

if __name__ == "__main__":
    pass