    import React from "react";

    function LoginActivity(props){
        const [isLogin,setIsLogin]=React.useState(true);

        return(
            <div className="login_activity_main">
                <div className="div_for_style_1">
                    <div>
                        <img src="./docker.svg"></img>
                    </div>
                </div>
                <div className="div_for_style_2">
                    <div>
                        <img src="./load.svg"></img>
                    </div>
                </div>
                <div className="div_for_style_3">
                    <div>
                        <img src="./kubernetes.svg"></img>
                    </div>
                </div>
                <div className="div_for_style_4">
                    <div>
                        <img src="./logs.webp"></img>
                    </div>
                </div>
                <div className="login_activity_card">
                    {isLogin?
                        <div className={`login_card ${isLogin?"add_card_login":""}`}>  
                            <div>
                                <div>
                                    <i class="ri-user-line image_icon"></i>
                                </div>
                                <div>
                                    <input placeholder="Username"></input>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <i class="ri-key-fill image_icon"></i>
                                </div>
                                <div>
                                <input placeholder="Password"></input>
                                </div>
                            </div>
                            <div className="dont_have_account_div">
                                <p>Don't have an account? <span className="activity_login_changer" onClick={()=>{setIsLogin(false)}}>Register</span></p>
                            </div>
                            <div className="login_button_div">
                                <div>
                                    <div>
                                    <img src="./google.svg" className="image_login"></img>
                                    </div>
                                    <div>
                                        <p>Continue with google</p>
                                    </div>
                                </div>
                                <div onClick={()=>{props.setAuthToTrue()}}>
                                    <div>
                                        <img src="./login.svg" className="image_login"></img>
                                    </div>
                                    <div>
                                        <p>Login</p>
                                    </div>
                                </div>
                            </div> 
                        </div>
                    :
                        <div className={`register_card ${isLogin?"":"add_card_register"}`} >
                            <div>
                                <div>
                                    <i class="ri-user-line image_icon"></i>
                                </div>
                                <div>
                                    <input placeholder="Username"></input>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <i class="ri-key-fill image_icon"></i>
                                </div>
                                <div>
                                <input placeholder="Password"></input>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <i class="ri-key-fill image_icon"></i>
                                </div>
                                <div>
                                <input placeholder="Password"></input>
                                </div>
                            </div>
                            <div className="dont_have_account_div">
                                <p>Already have an account? <span className="activity_login_changer" onClick={()=>{setIsLogin(true)}}>Login</span></p>
                            </div>
                            <div className="login_button_div">
                                <div>
                                    <div>
                                        <img src="./login.svg" className="image_login"></img>
                                    </div>
                                    <div>
                                        <p>Register</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>
        )
    }

    export default LoginActivity;