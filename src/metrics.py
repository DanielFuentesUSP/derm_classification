import pandas as pd
import numpy as np

from  config import *
from sklearn.metrics import accuracy_score, classification_report
import keras
from  dataset_creator import *

def metrics(model, dict_generator):  
    class_names = dict_generator.get("train").class_indices
    class_names = list(class_names.keys()) #lista com cada classe 
    
    print('class_names ', class_names)
    summary_acc=[]

    for dataset in dict_generator:
        print(f"Calculando metricas para {dataset}")
        ds_gen =  dict_generator.get(dataset)
        scores = model.predict(ds_gen, verbose=0)
        labels_ids = ds_gen.classes
        filenames = ds_gen.filenames
        preds_ids = np.argmax(scores, axis = 1)
        labels_name = [class_names[index] for index in labels_ids]
        preds_name = [class_names[index] for index in preds_ids]

        predictons_df = pd.DataFrame({'filename':filenames,  'label': labels_name, 'prediction': preds_name})
        print(class_names)
        print('predictons_df')
        print(predictons_df)
        print('scores ', len(scores))
        print('scores ', scores)
        predictons_df[class_names] = scores
        
        predictons_df.to_csv(os.path.join(results_dir, dataset+'-predictions.csv'), index=False)
        
        ds_acc = accuracy_score(predictons_df['label'], predictons_df['prediction']) *100 
        print(f"Acuracia {dataset} = ",ds_acc )
        summary_acc.append({'dataset':dataset, 'acc':ds_acc })
        
        report = classification_report(predictons_df['label'], predictons_df['prediction'], labels=class_names, output_dict=True)
        print(report)
        pd.DataFrame(report).transpose().to_csv(os.path.join(results_dir, dataset+'-report.csv'))
        
    pd.DataFrame(summary_acc).to_csv(os.path.join(results_dir, dataset+'-acc_sumary.csv'), index=False)
        
    

if __name__ == "__main__":
    print("Iniciando metrics!!")
    dict_generator = load_data()
    print(model_dir)
    model = keras.models.load_model(model_dir)
    metrics(model, dict_generator)