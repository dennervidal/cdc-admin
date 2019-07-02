import React, { Component } from 'react';
import $ from 'jquery';
import InputCustomizado from './componentes/InputCustomizado';
import PubSub from 'pubsub-js';
import TratadorErros from './TratadorErros';

class FormularioAutor extends Component {
    constructor(){
        super();
        this.state = {nome: '', email: '', senha: ''};
    }

    enviaForm(evento){
    evento.preventDefault();
        $.ajax({
            url: "http://localhost:8080/api/autores",
            contentType: "application/json",
            dataType: 'json',
            type: 'post',
            data: JSON.stringify({nome: this.state.nome, email: this.state.email, senha: this.state.senha}),
            success: function(resposta){
                this.props.callbackAtualizaListagem(resposta);
                //PubSub.publish('atualiza-lista-autores', resposta);
                this.setState({nome: '', email: '', senha: ''});
            }.bind(this),
            error: function(resposta){
                if(resposta.status === 400){
                    new TratadorErros().publicaErros(resposta.responseJSON);
                }
            },
            beforeSend: function(){
                PubSub.publish("limpa-erros", {});
            }
        });
    }

    salvaAlteracao(nomeInput, evento){
        this.setState({[nomeInput]: evento.target.value});
    }

    render(){
        return (
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm.bind(this)} method="post">
                  <InputCustomizado id="nome" type="text" name="nome" value={this.state.nome} onChange={this.salvaAlteracao.bind(this,'nome')} label="Nome" />
                  <InputCustomizado id="email" type="email" name="email" value={this.state.email} onChange={this.salvaAlteracao.bind(this,'email')} label="Email" />
                  <InputCustomizado id="senha" type="password" name="senha" value={this.state.senha} onChange={this.salvaAlteracao.bind(this,'senha')} label="Senha" />
                                    
                  <div className="pure-control-group">                                  
                    <label></label> 
                    <button type="submit" className="pure-button pure-button-primary">Gravar</button>                                    
                  </div>
                </form>             

              </div>  
        );
    }
}

class ListaAutores extends Component {

    render(){
        return (
            <div>           
                <table className="pure-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      this.props.lista.map(function(autor){
                        return (
                          <tr key={autor.id}>
                            <td>{autor.nome}</td>
                            <td>{autor.email}</td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table> 
              </div>           
        );
    }
}

export default class AutorBox extends Component{

    constructor(){
        super();
        this.state = {lista: []};
    }

    componentDidMount(){
        $.ajax({
            url: "http://localhost:8080/api/autores",
            dataType: "json",
            success: function(resposta){
                this.setState({lista: resposta});
            }.bind(this)
        });
        //PubSub.subscribe('atualiza-lista-autores', function(topico, resposta){ this.setState({lista: resposta}); }.bind(this));
    }

    atualizaListagem(novaLista){
        this.setState({lista: novaLista});
    }

    render(){
        return (
            <div>
                <div className="header">
                    <h1>Cadastro de autores</h1>
                </div>
                <div className="content" id="content">   
                    <FormularioAutor callbackAtualizaListagem={this.atualizaListagem.bind(this)}/>
                    <ListaAutores lista={this.state.lista}/> 
                </div>
            </div>
        );
    }

}