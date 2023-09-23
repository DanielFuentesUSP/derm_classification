# derm_classification

## Como usar esse projeto?
Este repositório mantemos os notebooks e os scripts que executados em bash no servidor.

Na pasta job scripts temos script bash para submeter jobs usando PBSPRO ([http://portal.nacad.ufrj.br/online/ug/ug/pbs.html#id4]).

Na pasta src temos scripts python que podem ser executados pelos jobs.

Para um novo conjunto de dados alterar caminhos no config.py.

Para alterar configurações de Treino checar opções no config.py.

Criador de dataset espera um pasta com subpastas onde cada subpasta é um classe com as imgs correspondentes dentro.

Treino utiliza a resnet50.

Os notebooks de dev mantemos na pasta notebooks 

