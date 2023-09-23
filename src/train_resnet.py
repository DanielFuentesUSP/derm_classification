
import matplotlib.pyplot as plt
import os
from tensorflow.keras.optimizers import Adam
from keras.models import Sequential
from keras.layers import Activation, Dropout, Flatten, Dense
 
from tensorflow.keras.applications.resnet50 import ResNet50
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score

from config import *

def get_model():
    model = Sequential()

    resnet_model= ResNet50(include_top=False,
                            input_shape=input_shape,
                            pooling='avg',classes=N_CLASSES,
                            weights='imagenet')

    # congela as camadas
    for layer in resnet_model.layers:
        layer.trainable=False
        
    # ultimas camadas densas - as quais serão treinadas
    model.add(resnet_model)
    model.add(Flatten())
    model.add(Dense(512, activation='relu'))
    model.add(Dense(N_CLASSES, activation='softmax'))


    model.summary()

    model.compile(optimizer=Adam(lr=LEARNING_RATE),loss='sparse_categorical_crossentropy',metrics=['accuracy'])

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

def save_predictions(model, dict_gen):
    datasets = ['train', 'val', 'test']
    class_names = dict_gen.get('train').class_indices
    class_names = list(class_names.keys()) #lista com cada classe 
    print('class_names ', class_names)

    summary_acc=[]
    for dataset in datasets:
        print(f"Calculando metricas para {dataset}")
        ds_gen =  dict_gen.get(dataset)
        scores = model.predict(ds_gen, verbose=0)
        labels_ids = ds_gen.classes
        filenames = ds_gen.filenames
        preds_ids = np.argmax(scores, axis = 1)
        labels_name = [class_names[label_index] for label_index in labels_ids]
        preds_name = [class_names[label_index] for label_index in preds_ids]

        predictons_df = pd.DataFrame({'filename':filenames,  'label': labels_name, 'prediction': preds_name})
        predictons_df[class_names] = scores
        
        predictons_df.to_csv(os.path.join(results_dir, dataset+'-predictions.csv'), index=False)
        
        ds_acc = accuracy_score(predictons_df['label'], predictons_df['prediction']) *100 
        print(f"Acuracia {dataset} = ",ds_acc )
        summary_acc.append({'dataset':dataset, 'acc':ds_acc })
        
    pd.DataFrame(summary_acc).to_csv(os.path.join(results_dir, 'acc_sumary.csv'), index=False)
        

def train_resnet(dict_gen: dict):
    print("Iniciando Treino")

    model = get_model()
    
    history = model.fit(
    dict_gen.get('train'),
    validation_data = dict_gen.get('val'),
    epochs=EPOCHS,
    )
    
    model.save(model_dir)
    save_learn_curve(history)
    
    save_predictions(model, dict_gen)
    
    return 

if __name__ == "__main__":
    pass